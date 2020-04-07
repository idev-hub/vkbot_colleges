import {Context, Keyboard,} from "vk-io";
import {isLogin} from "../services/users";
import {studyBot} from "..";
import {getCustomRepository, Like} from "typeorm";
import {CityRepository} from "../../database/repositories/CityRepository";
import {GenerateKeyboards, IKeyboardItem} from "../../../utils/GenerateKeyboards";
import {CollegeRepository} from "../../database/repositories/CollegeRepository";
import {UserRepository} from "../../database/repositories/UserRepository";
import {unique} from "../../../utils/ArrayService";

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

            return ctx.send("Ответьте, пожалуйста, на вопросы:\n\n1&#8419; - В каком городе вы обучаетесь?", {
                keyboard: Keyboard.keyboard(
                    GenerateKeyboards(cities.map(city => ({
                        text: `${city.name}`,
                        command: `${city.id}`
                    }) as IKeyboardItem), 4, 3, 2)
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
            const city = await cityRepository.find({name: Like(`%${ctx.scene.state.cityName}%`)}) // Проверяем выбранный город в базе данных

            if (city) {

                ctx.scene.state.city = city

                return ctx.send({
                    message: '&#129302; - Ваш город "' + city.name + '"? Если всё верно тогда продолжим',
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
                        message: '&#129302; - К сожалению для города "' + ctx.scene.state.cityName + '" еще не реализованы мои возможности. \n\nНо вы можете нажать кнопку "Связаться" и вскоре администрация рассмотрит вашу просьбу',
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
        } else if (ctx.text) {
            if (ctx.text.toLowerCase() === 'да' || ctx.text.toLowerCase() === 'верно') return ctx.scene.step.next()
            if (ctx.text.toLowerCase() === 'нет' || ctx.text.toLowerCase() === 'не верно') return ctx.scene.step.previous()
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
                    message: '2&#8419; - В каком учебном учреждении вы обучаетесь?',
                    keyboard: Keyboard.keyboard(
                        GenerateKeyboards(colleges.map(college => ({
                            text: `${college.name}`,
                            command: `${college.id}`
                        }) as IKeyboardItem), 4, 3, 2)
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
            const college = await collegeRepository.find({name: Like(`%${ctx.scene.state.collegeName}%`)})

            if (college) {

                ctx.scene.state.college = college

                return ctx.send({
                    message: '&#129302; - Ваше учебное учреждение называется - "' + college.name + '"? Если всё верно тогда продолжим',
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
                        message: '&#129302; - К сожалению для учебного учреждения "' + ctx.scene.state.collegeName + '" еще не реализованы мои возможности. \n\nНо вы можете нажать кнопку "Связаться" и вскоре администрация рассмотрит вашу просьбу',
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
        } else if (ctx.text) {
            if (ctx.text.toLowerCase() === 'да' || ctx.text.toLowerCase() === 'верно') return ctx.scene.step.next()
            if (ctx.text.toLowerCase() === 'нет' || ctx.text.toLowerCase() === 'не верно') return ctx.scene.step.previous()
        }
    },
    /**
     * Шаг 5
     * - Узнаем группу/класс пользователя в учебном учреждение
     **/
    async (ctx: Context) => {
        if (ctx.scene.step.firstTime || !ctx.text) {

            const userRepository = await getCustomRepository(UserRepository)
            const users = await userRepository.search({college: ctx.scene.state.college})

            return ctx.send({
                message: '3&#8419; - Напишите название/номер своей группы/класса.',
                keyboard: Keyboard.keyboard(
                    GenerateKeyboards(unique(users.map(user => user.group)).map(value => ({
                        text: `${value}`,
                        command: `${value}`
                    }) as IKeyboardItem), 4, 3, 2)
                ).oneTime()
            })
        }

        // Запоминаем введенную группу
        ctx.scene.state.group = ctx.text.trim()
        return ctx.scene.step.next()
    },
    /**
     * Шаг 6
     * - Проверяем группу/класс пользователя в учебном учреждение
     **/
    async (ctx: Context) => {
        if (ctx.scene.step.firstTime || !ctx.text) {
            return ctx.send({
                message: '&#129302; - Вы уверены что ВЕРНО написали свою группу - "' + ctx.scene.state.group + '"? Всё верно? Это последний вопрос',
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
        if (ctx.messagePayload) { // Ждем нажатия кнопок
            if (ctx.messagePayload.command === 'next') return ctx.scene.step.next()
            if (ctx.messagePayload.command === 'prev') return ctx.scene.step.previous()
        } else if (ctx.text) {
            if (ctx.text.toLowerCase() === 'да' || ctx.text.toLowerCase() === 'верно') return ctx.scene.step.next()
            if (ctx.text.toLowerCase() === 'нет' || ctx.text.toLowerCase() === 'не верно') return ctx.scene.step.previous()
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