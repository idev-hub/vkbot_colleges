import {bot} from "../Bot"
import {StepScene} from '@vk-io/scenes'
import {Keyboard} from "vk-io";
import {getCity} from "./cities";
import {getCollege} from "./colleges";
import {addUser, isLogin} from "./users";

// Register scene
bot.sceneManager.addScene(new StepScene('registerScene', [
    async (ctx) => { // STEP 1

        if (ctx.session.user) { // Сбрасываем активную сессию пользователя, если она существует
            ctx.session.user = undefined
        }

        if (ctx.scene.step.firstTime || !ctx.text) {
            const cities = await getCity() // Запрашиваем все города
            let keyboards = [], index = 0;

            for (const city of cities) {
                if (index < 3) {
                    keyboards.push(Keyboard.textButton({
                        label: city['name'],
                        color: Keyboard.PRIMARY_COLOR
                    }))
                    index++;
                } else break;
            }
            return ctx.send({
                message: '1&#8419; - В каком городе ты обучаешься?',
                keyboard: Keyboard.keyboard([
                    keyboards
                ]).oneTime()
            });
        }

        // Запоминаем введенные город
        ctx.scene.state.cityName = ctx.text.trim().toLowerCase();
        return ctx.scene.step.next()
    },
    async (ctx) => { // STEP 2
        if (ctx.scene.step.firstTime || !ctx.text) {

            // Проверяем этого город в базе данных
            const city = await getCity({name: ctx.scene.state.cityName})
            if (city.length > 0) {
                let name = city[0]['name']

                ctx.scene.state.city = city[0] // Перезаписываем данные города на полные - между сценами

                return ctx.send({
                    message: '&#129302; - Твой город "' + name + '"? Если всё верно тогда продолжим',
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
                    if(user) keyboard = user.college.params.keyboards

                    await ctx.send({
                        message: '&#129302; - Прости для города "'+ctx.scene.state.cityName+'" еще не реализованы мои возможности. \n\nНо ты можешь попросить разработчика рассмотреть реализацию возможностей для меня. Просто нажми кнопку "Связаться" и тебе вскоре напишут что бы узнать дополнительную информацию',
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
    async (ctx) => { // STEP 3

        if (ctx.scene.step.firstTime || !ctx.text) {
            const colleges = await getCollege({city: ctx.scene.state.city["id"]}) // Получаем колледжы выбранного пользователем города

            if (colleges.length > 0) {
                let keyboards = [], index = 0;

                for (const college of colleges) {
                    if (index < 3) {

                        keyboards.push(Keyboard.textButton({
                            label: college['name'],
                            color: Keyboard.PRIMARY_COLOR
                        }))
                        index++;
                    } else break;
                }
                return ctx.send({
                    message: '2&#8419; - В каком учебном учреждении ты учишься?',
                    keyboard: Keyboard.keyboard([
                        keyboards
                    ]).oneTime()
                })
            } else {

                try {

                    let keyboard = []
                    const user = await isLogin(ctx)
                    if(user) keyboard = user.college.params.keyboards

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
    async (ctx) => { // STEP 4

        if (ctx.scene.step.firstTime || !ctx.text) {

            // Получаем наиболее подходящий колледж по запросу юзера
            const college = await getCollege({name: ctx.scene.state.collegeName})

            if (college.length > 0) {
                let name = college[0]['name'] // Получаем актуальное имя колледжа

                ctx.scene.state.college = college[0] // Перезаписываем данные коледжа на полные - между сценами

                return ctx.send({
                    message: '&#129302; - Твоё учебное учреждение называеться - "' + name + '"? Если всё верно тогда продолжим',
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
                    if(user) keyboard = user.college.params.keyboards

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
    async (ctx) => {
        if (ctx.scene.step.firstTime || !ctx.text) {
            return ctx.send({
                message: '3&#8419; - Напиши название/номер своей группы/класса.',
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: 'Подробнее',
                            payload: {command: 'helpGroup'},
                            color: Keyboard.POSITIVE_COLOR
                        })
                    ]
                ]).oneTime().inline()
            })
        }

        if (ctx.messagePayload) {
            if (ctx.messagePayload.command === 'helpGroup') {
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
    async (ctx) => {
        if (ctx.scene.step.firstTime || !ctx.text) {
            return ctx.send({
                message: '&#129302; - Ты уверен что ВЕРНО написал свою группу - "'+ctx.scene.state.group+'"? Если все верно, тогда поздравляю! Почти у цели',
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
    async (ctx) => { // STEP 5
        if (ctx.scene.step.firstTime || !ctx.text) {

            const {college, group} = ctx.scene.state

            try {
                let user = await addUser({
                    peerId: ctx.senderId,
                    college: college,
                    group: group,
                    gender: 0,
                    role: 0,
                    block: false
                })

                await ctx.send({
                    message: '&#129302; - Вот и всё.\n ' +
                        'Теперь ты можешь пользоваться моими возможностями.',
                    keyboard: Keyboard.keyboard(college.params.keyboards)
                })

                return ctx.scene.leave()

            } catch (err) {

                await ctx.send('Во время сохранения данных произошла ошибка.\n\n' + err)
                return ctx.scene.leave()

            }
        }

        return ctx.scene.step.next()
    }
]))

// Settings scene
bot.sceneManager.addScene(new StepScene('settingsScene', [
    async (ctx) => {
        if (ctx.scene.step.firstTime || !ctx.text) {
            return ctx.send({
                message: 'Что вы хотите настройть?',
                keyboard: Keyboard.keyboard([
                    [
                        Keyboard.textButton({
                            label: 'Отмена',
                            payload: {command: 'toMain'},
                            color: Keyboard.NEGATIVE_COLOR
                        }),
                        Keyboard.textButton({
                            label: 'Обновить данные',
                            payload: {command: 'register'},
                            color: Keyboard.POSITIVE_COLOR
                        })
                    ],
                    [
                        Keyboard.textButton({
                            label: 'Рассылка расписания',
                            payload: {command: 'autoLink'},
                            color: Keyboard.PRIMARY_COLOR
                        })
                    ]
                ])
            })
        }

        if (ctx.messagePayload) {
            if (ctx.messagePayload.command === 'toMain') {
                await ctx.send({
                    message: 'Вы вернулись на главную страницу',
                    keyboard: Keyboard.keyboard(await ctx.session.user.college.params.keyboards)
                })
                return ctx.scene.leave()
            }
            if (ctx.messagePayload.command === 'register') return ctx.scene.enter('registerScene')
            if (ctx.messagePayload.command === 'autoLink') return ctx.scene.leave()
        }
    }
]))