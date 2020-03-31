import {
    Context,
    Keyboard,
    MessageContext,
    MessagesSendParams,
    PhotoAttachment,
    StickerAttachment,
    VideoAttachment
} from "vk-io";
import {isLogin} from "../services/users";
import {studyBot} from "..";
import {getFoundInterlocutor} from "../services/dialogs";
import {getCustomRepository, Like} from "typeorm";
import {CityRepository} from "../../database/repositories/CityRepository";
import {GenerateKeyboards, IKeyboardItem} from "../../../utils/GenerateKeyboards";
import {CollegeRepository} from "../../database/repositories/CollegeRepository";
import {UserRepository} from "../../database/repositories/UserRepository";
import {DialogRepository} from "../../database/repositories/DialogRepository";


studyBot.updates.on('message', async (ctx: MessageContext, next) => {

    const toMessage = async () => {

        const {dialog} = ctx.session

        if (!ctx.messagePayload && (ctx.text || ctx.attachments)) {

            const {attachments, text} = ctx

            const message: MessagesSendParams = {
                dont_parse_links: true,
                peer_id: dialog.companion.peerId,
            }

            message['message'] = text ? `&#${dialog.smile}; - ${text}` : `&#${dialog.smile};`

            if (attachments.length > 0) {

                const attach = []

                await attachments.forEach(attachment => {

                    if (attachment instanceof StickerAttachment) {
                        return message['sticker_id'] = attachment.id
                    }

                    if (attachment instanceof PhotoAttachment || attachment instanceof VideoAttachment) {
                        attach.push(attachment.toString())
                    }

                })

                message['attachment'] = attach.toString()
            }

            return await studyBot.api.messages.send(message)
        }
        if (ctx.messagePayload) {
            if (ctx.messagePayload.command === 'search-companion') return ctx.scene.enter('search-companion-scene')
            if (ctx.messagePayload.command === 'leave-chat-room') {

                const dialogRepository = await getCustomRepository(DialogRepository)

                await dialogRepository.createOrUpdate({user: ctx.session.user, companion: null, search: null})
                await dialogRepository.createOrUpdate({user: dialog.companion, companion: null, search: null})

                await studyBot.api.messages.send({
                    peer_id: dialog.companion.peerId,
                    message: "&#129302; - Собеседник покинул чат.",
                    keyboard:
                        Keyboard.keyboard([
                            [
                                Keyboard.textButton({
                                    label: 'Вернуться к поиску',
                                    payload: {command: 'search-companion'},
                                    color: Keyboard.PRIMARY_COLOR
                                })
                            ]
                        ])
                })

                return ctx.scene.enter('search-companion-scene')
            }
        }
    }

    if (ctx.session.dialog) {
        await toMessage()
    } else {
        const dialogRepository = await getCustomRepository(DialogRepository)
        const local = await dialogRepository.find({user: ctx.session.user, search: 'communicate'})
        if (local) {
            ctx.session.dialog = local
            await toMessage()
        } else {
            return next()
        }
    }
})


/**
 * Сцена регистрации или обновления данных пользователя
 **/
studyBot.scene('register-scene', [
    /**
     * Шаг 1
     * - Узнаем город пользователя
     **/
    async (ctx: Context) => {

        ctx.session.user = undefined // Сбрасываем активную сессию пользователя

        if (ctx.scene.step.firstTime || !ctx.text) {

            const cityRepository = await getCustomRepository(CityRepository)
            const cities = await cityRepository.search() // Получаем доступные города

            return ctx.send("1&#8419; - В каком городе ты обучаешся?", {
                keyboard: Keyboard.keyboard(
                    GenerateKeyboards(cities.map(city => ({
                        text: `${city.name}`,
                        command: `${city.id}`
                    }) as IKeyboardItem), 4, 3, 3)
                ).oneTime()
            });
        }

        // Запоминаем введенные город
        ctx.scene.state.cityName = ctx.text.trim().toLowerCase();
        return ctx.scene.step.next()
    },
    /**
     * Шаг 2
     * - Проверяем выбранный город
     **/
    async (ctx: Context) => {
        if (ctx.scene.step.firstTime || !ctx.text) {

            const cityRepository = await getCustomRepository(CityRepository)
            const city = await cityRepository.find({name: Like(ctx.scene.state.cityName)}) // Проверяем выбранный город в базе данных

            if (city) {

                ctx.scene.state.city = city

                return ctx.send({
                    message: '&#129302; - Твой город "' + city.name + '"? Если всё верно тогда продолжим',
                    keyboard: Keyboard.keyboard([
                        [
                            Keyboard.textButton({
                                label: 'Верно',
                                payload: {command: 'next'},
                                color: Keyboard.POSITIVE_COLOR
                            }),
                            Keyboard.textButton({
                                label: 'Не верно',
                                payload: {command: 'prev'},
                                color: Keyboard.NEGATIVE_COLOR
                            })
                        ]
                    ]).oneTime()
                })

            } else { // Если города не существует

                try {

                    let keyboard = []
                    const user = await isLogin(ctx)
                    if (user) keyboard = user.college["params"]["keyboards"]

                    await ctx.send({
                        message: '&#129302; - Прости для города "' + ctx.scene.state.cityName + '" еще не реализованы мои возможности. \n\nНо ты можешь попросить разработчика рассмотреть реализацию возможностей для меня. Просто нажми кнопку "Связаться" и тебе вскоре напишут что бы узнать дополнительную информацию',
                        keyboard: Keyboard.keyboard([
                            Keyboard.textButton({
                                label: 'Связаться',
                                payload: {command: 'contact'},
                                color: Keyboard.PRIMARY_COLOR
                            })
                        ]).oneTime().inline()
                    })

                    await ctx.send({
                        message: 'Вы вернулись на главную страницу',
                        keyboard: Keyboard.keyboard(keyboard)
                    })

                } catch (err) {
                    console.error(err)
                }

                return ctx.scene.leave()
            }

        }

        if (ctx.messagePayload) { // Ждем нажатия кнопок
            if (ctx.messagePayload.command === 'next') return ctx.scene.step.next()
            if (ctx.messagePayload.command === 'prev') return ctx.scene.step.previous()
        }
    },
    /**
     * Шаг 3
     * - Узнаем учебное учреждение
     **/
    async (ctx: Context) => {

        if (ctx.scene.step.firstTime || !ctx.text) {
            const collegeRepository = await getCustomRepository(CollegeRepository)
            const colleges = await collegeRepository.search({city: ctx.scene.state.city}) // Получаем колледжы города

            if (colleges.length > 0) {
                return ctx.send({
                    message: '2&#8419; - В каком учебном учреждении ты учишься?',
                    keyboard: Keyboard.keyboard(
                        GenerateKeyboards(colleges.map(college => ({
                            text: `${college.name}`,
                            command: `${college.id}`
                        }) as IKeyboardItem), 4, 3, 3)
                    ).oneTime()
                })
            } else {

                try {

                    let keyboard = []
                    const user = await isLogin(ctx)
                    if (user) keyboard = user.college["params"]["keyboards"]

                    await ctx.send({
                        message: '&#129302; - Я пока что не умею работать с учебными учреждениями в этом городе. \n\nНо ты можешь попросить разработчика рассмотреть реализацию возможностей для меня. Просто нажми кнопку "Связаться" и тебе вскоре напишут что бы узнать дополнительную информацию',
                        keyboard: Keyboard.keyboard([
                            Keyboard.textButton({
                                label: 'Связаться',
                                payload: {command: 'contact'},
                                color: Keyboard.PRIMARY_COLOR
                            })
                        ]).oneTime().inline()
                    })

                    await ctx.send({
                        message: 'Вы вернулись на главную страницу',
                        keyboard: Keyboard.keyboard(keyboard)
                    })

                } catch (err) {
                    console.error(err)
                }

                return ctx.scene.leave()

            }
        }

        // Запоминаем введенный колледж
        ctx.scene.state.collegeName = ctx.text.trim()
        return ctx.scene.step.next()
    },
    /**
     * Шаг 4
     * - Проверяем выбранное учебное учреждение
     **/
    async (ctx: Context) => {

        if (ctx.scene.step.firstTime || !ctx.text) {

            // Получаем наиболее подходящий колледж по запросу юзера
            const collegeRepository = await getCustomRepository(CollegeRepository)
            const college = await collegeRepository.find({name: Like(ctx.scene.state.collegeName)})

            if (college) {

                ctx.scene.state.college = college

                return ctx.send({
                    message: '&#129302; - Твоё учебное учреждение называется - "' + college.name + '"? Если всё верно тогда продолжим',
                    keyboard: Keyboard.keyboard([
                        [
                            Keyboard.textButton({
                                label: 'Верно',
                                payload: {command: 'next'},
                                color: Keyboard.POSITIVE_COLOR
                            }),
                            Keyboard.textButton({
                                label: 'Не верно',
                                payload: {command: 'prev'},
                                color: Keyboard.NEGATIVE_COLOR
                            })
                        ]
                    ]).oneTime()
                })
            } else {

                try {

                    let keyboard = []
                    const user = await isLogin(ctx)
                    if (user) keyboard = user.college["params"]["keyboards"]

                    await ctx.send({
                        message: '&#129302; - Прости для "' + ctx.scene.state.collegeName + '" еще не реализованы мои возможности. \n\nНо ты можешь попросить разработчика рассмотреть реализацию возможностей для меня. Просто нажми кнопку "Связаться" и тебе вскоре напишут что бы узнать дополнительную информацию',
                        keyboard: Keyboard.keyboard([
                            Keyboard.textButton({
                                label: 'Связаться',
                                payload: {command: 'contact'},
                                color: Keyboard.PRIMARY_COLOR
                            })
                        ]).oneTime().inline()
                    })

                    await ctx.send({
                        message: 'Вы вернулись на главную страницу',
                        keyboard: Keyboard.keyboard(keyboard)
                    })

                } catch (err) {
                    console.error(err)
                }

                return ctx.scene.leave()

            }
        }
        if (ctx.messagePayload) {
            if (ctx.messagePayload.command === 'next') return ctx.scene.step.next()
            if (ctx.messagePayload.command === 'prev') return ctx.scene.step.previous()
        }
    },
    /**
     * Шаг 5
     * - Узнаем группу/класс пользователя в учебном учреждение
     **/
    async (ctx: Context) => {
        if (ctx.scene.step.firstTime || !ctx.text) {
            return ctx.send({
                message: '3&#8419; - Напиши название/номер своей группы/класса.',
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: 'Подробнее',
                            payload: {command: 'help-group'},
                            color: Keyboard.POSITIVE_COLOR
                        })
                    ]
                ]).oneTime().inline()
            })
        }

        if (ctx.messagePayload) {
            if (ctx.messagePayload.command === 'help-group') {
                return ctx.send({
                    message: '&#129302; - Нужно написать свою группу/класс в вашем учебном учреждении. Писать нужно так же как указано в официальных источниках. Как правило узнать можно на сайте учебного учреждения.\nВо многих учебных учреждених ваша группа/класс меняются когда вы оканчиваете учебный год и переходите на следющий.\n\n К примеру в ЧГПГТ им. А.В. Яковлева, каждый год у группы меняется первая цифры.\n1 курс - 107\n2 курс - 207\n3 курс - 307\n\nЯ не умею сам менять эти значения, каждый год вам придёться обновлять свою группу, для этого нужно будет зайти в настройки\n\n\n3&#8419; - Напишите название/номер своей группы/класса.'
                })
            }
        } else {
            // Запоминаем введенную группу
            ctx.scene.state.group = ctx.text.trim()
            return ctx.scene.step.next()
        }
    },
    /**
     * Шаг 6
     * - Проверяем группу/класс пользователя в учебном учреждение
     **/
    async (ctx: Context) => {
        if (ctx.scene.step.firstTime || !ctx.text) {
            return ctx.send({
                message: '&#129302; - Ты уверен что ВЕРНО написал свою группу - "' + ctx.scene.state.group + '"? Если все верно, тогда поздравляю! Почти у цели',
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: 'Верно',
                            payload: {command: 'next'},
                            color: Keyboard.POSITIVE_COLOR
                        }),
                        Keyboard.textButton({
                            label: 'Не верно',
                            payload: {command: 'prev'},
                            color: Keyboard.NEGATIVE_COLOR
                        })
                    ]
                ]).oneTime()
            })
        }
        if (ctx.messagePayload) {
            if (ctx.messagePayload.command === 'next') return ctx.scene.step.next()
            if (ctx.messagePayload.command === 'prev') return ctx.scene.step.previous()
        }
    },
    /**
     * Шаг 6
     * - Создаем пользователя
     **/
    async (ctx: Context) => {
        if (ctx.scene.step.firstTime || !ctx.text) {

            const {college, group} = ctx.scene.state

            try {

                const userRepository = await getCustomRepository(UserRepository)
                await userRepository.createOrUpdate({
                    peerId: ctx.senderId,
                    college: college,
                    group: group,
                    gender: 0,
                    role: 0,
                    block: false
                })

                return ctx.scene.enter('timetable-scene')

            } catch (err) {

                await ctx.send('Во время сохранения данных произошла ошибка.\n\n' + err)

                return ctx.scene.step.next()

            }
        }

        return ctx.scene.step.next()
    }
])

/**
 * Сцена с расписанием
 **/
studyBot.scene('timetable-scene', [
    /**
     * Шаг 1
     * - Отправляем приветсвие с клавиатурой расписания
     **/
    async (ctx: Context) => {

        if (ctx.scene.step.firstTime || !ctx.text) {
            const user = await isLogin(ctx)
            await ctx.send({
                message: 'На какой день вы хотите получить расписание?',
                keyboard: Keyboard.keyboard(user['college']['params']['keyboards'])
            })
        }

        return ctx.scene.leave()
    }
])


/**
 * Поиск комнаты для общения
 **/
studyBot.scene('search-companion-scene', [
    /**
     * Шаг 1
     * - Отправляем приветсвие с клавиатурой поиска
     **/
    async (ctx: Context) => {


        if (ctx.scene.step.firstTime || !ctx.text) {

            ctx.session.dialog = undefined

            const dialogRepository = await getCustomRepository(DialogRepository)

            await dialogRepository.createOrUpdate({user: ctx.session.user, companion: null, search: null})
            const dialog = await dialogRepository.find({user: ctx.session.user})

            if (dialog.smile === null) {
                return ctx.send({
                    message: 'Выберете свой смайлик. Он будет виден вашему собеседнику',
                    keyboard:
                        Keyboard.keyboard([
                            [
                                Keyboard.textButton({
                                    label: '&#128516;',
                                    payload: {command: '128516'},
                                    color: Keyboard.PRIMARY_COLOR
                                }),
                                Keyboard.textButton({
                                    label: '&#128519;',
                                    payload: {command: '128519'},
                                    color: Keyboard.PRIMARY_COLOR
                                }),
                                Keyboard.textButton({
                                    label: '&#128523;',
                                    payload: {command: '128523'},
                                    color: Keyboard.PRIMARY_COLOR
                                }),
                                Keyboard.textButton({
                                    label: '&#128525;',
                                    payload: {command: '128525'},
                                    color: Keyboard.PRIMARY_COLOR
                                }),
                                Keyboard.textButton({
                                    label: '&#128563;',
                                    payload: {command: '128563'},
                                    color: Keyboard.PRIMARY_COLOR
                                }),
                            ],
                            [
                                Keyboard.textButton({
                                    label: '&#128567;',
                                    payload: {command: '128567'},
                                    color: Keyboard.PRIMARY_COLOR
                                }),
                                Keyboard.textButton({
                                    label: '&#128123;',
                                    payload: {command: '128123'},
                                    color: Keyboard.PRIMARY_COLOR
                                }),
                                Keyboard.textButton({
                                    label: '&#128520;',
                                    payload: {command: '128520'},
                                    color: Keyboard.PRIMARY_COLOR
                                }),
                                Keyboard.textButton({
                                    label: '&#128056;',
                                    payload: {command: '128056'},
                                    color: Keyboard.PRIMARY_COLOR
                                }),
                                Keyboard.textButton({
                                    label: '&#128060;',
                                    payload: {command: '128060'},
                                    color: Keyboard.PRIMARY_COLOR
                                })
                            ]
                        ])
                })

            } else {
                return ctx.send({
                    message: 'Начать поиск собеседника?',
                    keyboard:
                        Keyboard.keyboard([
                            [
                                Keyboard.textButton({
                                    label: '&#128218; Вернутся к расписанию',
                                    payload: {command: 'to-timetable'},
                                    color: Keyboard.NEGATIVE_COLOR
                                }),
                                Keyboard.textButton({
                                    label: '&#128270; Начать поиск',
                                    payload: {command: 'start-search'},
                                    color: Keyboard.POSITIVE_COLOR
                                })
                            ]
                        ])
                })
            }
        }

        if (ctx.messagePayload) {
            if (ctx.messagePayload.command === 'to-timetable') {

                return ctx.scene.enter('timetable-scene')

            } else if (ctx.messagePayload.command === 'start-search') {

                return ctx.scene.step.next()

            } else if (ctx.messagePayload.command) {

                const dialogRepository = await getCustomRepository(DialogRepository)
                await dialogRepository.createOrUpdate({user: ctx.session.user, smile: ctx.messagePayload.command})
                return ctx.scene.step.next()

            }
        }
    },
    /**
     * Шаг 2
     * - Идёт поиск
     **/
    async (ctx: MessageContext) => {

        if (ctx.scene.step.firstTime || !ctx.text) {

            const dialogRepository = await getCustomRepository(DialogRepository)

            ctx.session.companion = undefined

            await ctx.send({
                message: '&#129302; - Идёт поиск',
                keyboard:
                    Keyboard.keyboard([
                        [
                            Keyboard.textButton({
                                label: '&#9940; Отменить поиск',
                                payload: {command: 'cancel-search-companion'},
                                color: Keyboard.NEGATIVE_COLOR
                            })
                        ]
                    ])
            })

            await dialogRepository.createOrUpdate({user: ctx.session.user, companion: null, search: "search"})
            const dialog = await getFoundInterlocutor(ctx.session.user)

            if (dialog) {

                ctx.scene.state.companion = dialog.user

                await dialogRepository.createOrUpdate({
                    user: ctx.session.user,
                    companion: dialog.user,
                    search: "communicate"
                })

                await dialogRepository.createOrUpdate({
                    user: dialog.user,
                    companion: ctx.session.user,
                    search: "communicate"
                })

                return ctx.scene.step.next()
            } else {

                await ctx.send({
                    message: '&#129302; - Сейчас собеседников нет. Я поставил тебя в очередь. Поиск собеседника будет выполнятся до тех пор, пока не нажмете "Отменить поиск"'
                })

                return ctx.scene.leave()
            }
        }
    },
    /**
     * Шаг 3
     * - Собеседник найден
     **/
    async (ctx: Context) => {

        await studyBot.api.messages.send({
            user_ids: [ctx.scene.state.companion.peerId, ctx.session.user.peerId],
            message: '&#129302; - Собеседник найден.\nНапиши "привет"!',
            keyboard:
                Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: 'Закончить общение',
                            payload: {command: 'leave-chat-room'},
                            color: Keyboard.NEGATIVE_COLOR
                        })
                    ]
                ])
        })

        return ctx.scene.leave()
    }
])


/**
 * Сцена с доп. настройками
 **/
studyBot.scene('more-scene', [
    /**
     * Шаг 1
     * - Отправляем приветсвие с клавиатурой расписания
     **/
    async (ctx: Context) => {
        if (ctx.scene.step.firstTime || !ctx.text) {
            await ctx.send({
                message: 'Что вы хотите сделать?',
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: '&#128218; Вернутся к расписанию',
                            payload: {command: 'to-timetable'},
                            color: Keyboard.NEGATIVE_COLOR
                        }),
                        Keyboard.textButton({
                            label: '&#9889; Настройки',
                            payload: {command: 'to-settings'},
                            color: Keyboard.NEGATIVE_COLOR
                        })
                    ],
                    [
                        Keyboard.textButton({
                            label: '&#9996; Анонимный чат (Beta)',
                            payload: {command: 'search-companion'},
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ]
                ])
            })
        }

        return ctx.scene.leave()
    }
])


/**
 * Сцена с настройками бота
 **/
studyBot.scene('settings-scene', [
    /**
     * Шаг 1
     * - Спрашиваем что хочет пользователь настройть
     **/
    async (ctx: Context) => {

        const keyboards = [
            [
                Keyboard.textButton({
                    label: '&#128218; Вернутся к расписанию',
                    payload: {command: 'to-timetable'},
                    color: Keyboard.NEGATIVE_COLOR
                }),
                Keyboard.textButton({
                    label: '&#128296; Обновить мой данные',
                    payload: {command: 'register'},
                    color: Keyboard.PRIMARY_COLOR
                })
            ]
        ]

        if (ctx.scene.step.firstTime || !ctx.text) {

            const userRepository = await getCustomRepository(UserRepository)
            const user = await userRepository.find({
                peerId: ctx.session.user.peerId
            })

            if (user.autoLink) {
                keyboards.push([
                    Keyboard.textButton({
                        label: '&#128277; Отписаться от рассылки',
                        payload: {command: 'unsubscribe'},
                        color: Keyboard.NEGATIVE_COLOR
                    })
                ])
            } else {
                keyboards.push([
                    Keyboard.textButton({
                        label: '&#128276; Подписаться на рассылку',
                        payload: {command: 'subscribe'},
                        color: Keyboard.POSITIVE_COLOR
                    })
                ])
            }

            await ctx.send({
                message: 'Что вы хотите настройть?',
                keyboard: Keyboard.keyboard(keyboards)
            })
        }

        return ctx.scene.leave()
    }
])