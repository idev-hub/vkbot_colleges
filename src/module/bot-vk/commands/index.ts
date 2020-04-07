import {Context, Keyboard} from "vk-io";
import {DateTime} from 'luxon';
import {studyBot} from "..";
import Luxon from "../../../utils/Luxon";
import {getCompleteTimetable} from "../services/colleges";
import RSSParser from "../../../utils/RSSParser";
import {getCustomRepository} from "typeorm";
import {UserRepository} from "../../database/repositories/UserRepository";

/**
 * Команда для связи с разработчиком
 **/
studyBot.command('contact', ['связаться'], async (ctx: Context) => {

    const userRepository = await getCustomRepository(UserRepository)
    const users = await userRepository.search({role: 9})

    for (const user of users) {

        try {
            await studyBot.api.messages.send({
                user_id: user.peerId,
                message: `Пользователь @id${ctx.peerId} попросил связаться с ним.\n\nСсылка на чат: vk.com/gim${ctx.$groupId}?sel=${ctx.peerId}`,
            })
        } catch (error) {
            console.error({error})
        }

    }

    return ctx.send(`Заявка успешно отправлена.`)
})

/**
 * Команда получения расписания за ВЧЕРА
 **/
studyBot.command('yesterday', ['вчера', 'в'], async (ctx: Context) => {
    let date = new Luxon().subtract(24)
    const template = await getCompleteTimetable(ctx, date)

    return ctx.send({
        message: `&#128217; Расписание на "Вчера" - "${date.pin()}" для группы "${ctx.session.user.group}"\n\n${template}`,
        keyboard: Keyboard.keyboard([
            [
                Keyboard.textButton({
                    label: "Сегодня",
                    payload: {command: 'today'},
                    color: Keyboard.POSITIVE_COLOR
                }),
                Keyboard.textButton({
                    label: "Завтра",
                    payload: {command: 'tomorrow'},
                    color: Keyboard.PRIMARY_COLOR
                })
            ]
        ]).inline()
    })
})

/**
 * Команда получения расписания за СЕГОДНЯ
 **/
studyBot.command('today', ['сегодня', 'с'], async (ctx: Context) => {
    let date = new Luxon()
    const template = await getCompleteTimetable(ctx, date)

    return ctx.send({
        message: `&#128217; Расписание на "Сегодня" - "${date.pin()}" для группы "${ctx.session.user.group}"\n\n${template}`,
        keyboard: Keyboard.keyboard([
            [
                Keyboard.textButton({
                    label: "Завтра",
                    payload: {command: 'tomorrow'},
                    color: Keyboard.POSITIVE_COLOR
                }),
                Keyboard.textButton({
                    label: "Послезавтра",
                    payload: {command: 'afterTomorrow'},
                    color: Keyboard.PRIMARY_COLOR
                })
            ]
        ]).inline()
    })
})

/**
 * Команда получения расписания на ЗАВТРА
 **/
studyBot.command('tomorrow', ['завтра', 'з'], async (ctx: Context) => {
    let date = new Luxon().add(24)
    const template = await getCompleteTimetable(ctx, date)

    return ctx.send({
        message: `&#128217; Расписание на "Завтра" - "${date.pin()}" для группы "${ctx.session.user.group}"\n\n${template}`,
        keyboard: Keyboard.keyboard([
            [
                Keyboard.textButton({
                    label: "Сегодня",
                    payload: {command: 'today'},
                    color: Keyboard.POSITIVE_COLOR
                }),
                Keyboard.textButton({
                    label: "Послезавтра",
                    payload: {command: 'afterTomorrow'},
                    color: Keyboard.PRIMARY_COLOR
                })
            ]
        ]).inline()
    })
})

/**
 * Команда получения расписания на ПОСЛЕЗАВТРА
 **/
studyBot.command('after-tomorrow', ['послезавтра', 'пз'], async (ctx: Context) => {
    let date = new Luxon().add(48)
    const template = await getCompleteTimetable(ctx, date)

    return ctx.send({
        message: `&#128217; Расписание на "Послезавтра" - "${date.pin()}" для группы "${ctx.session.user.group}"\n\n${template}`,
        keyboard: Keyboard.keyboard([
            [
                Keyboard.textButton({
                    label: "Сегодня",
                    payload: {command: 'today'},
                    color: Keyboard.POSITIVE_COLOR
                }),
                Keyboard.textButton({
                    label: "Завтра",
                    payload: {command: 'tomorrow'},
                    color: Keyboard.PRIMARY_COLOR
                })
            ]
        ]).inline()
    })
})

/**
 * Команда перехода на сцену с расписанием занятий
 **/
studyBot.command('to-timetable', ['расписание', 'расп'], async (ctx: Context) => ctx.scene.enter('timetable-scene'))

/**
 * Команда перехода на сцену с регистрацией ( работает как функция обновления и создания данных о пользователе )
 **/
studyBot.command('register', ['обновить'], (ctx: Context) => ctx.scene.enter('register-scene'))

/**
 * Команда перехода на сцену с настройками пользователя
 **/
studyBot.command('to-settings', ['настройки'], (ctx: Context) => ctx.scene.enter('settings-scene'))

/**
 * Команда перехода на сцену с доп. функционалом
 **/
studyBot.command('to-more', ['еще', 'ещё'], (ctx: Context) => ctx.scene.enter('more-scene'))


/**
 * Подписка на авторассылку
 * @beta
 **/
studyBot.command('subscribe', ['подписаться'], async (ctx: Context) => {
    const userRepository = await getCustomRepository(UserRepository)
    await userRepository.createOrUpdate({peerId: ctx.session.user.peerId, autoLink: true})
    await ctx.send({
        message: `Вы успешно подписались на авторассылку расписания. Раписание придёт в 19:00 по Москве.`
    })
    return ctx.scene.enter('timetable-scene')
})

/**
 * Отписка от авторассылки
 * @beta
 **/
studyBot.command('unsubscribe', ['описаться'], async (ctx: Context) => {
    const userRepository = await getCustomRepository(UserRepository)
    await userRepository.createOrUpdate({peerId: ctx.session.user.peerId, autoLink: false})
    await ctx.send({
        message: `Вы успешно отписались от авторассылки расписания.`
    })
    return ctx.scene.enter('timetable-scene')
})

/**
 * Команда вызова помощи
 **/
studyBot.command('help', ['help', 'помощь'], async (ctx: Context) => {
    return ctx.send(`
        Справка по командам:\n
        - "завтра" или "з", "сегодня" или "с", "послезавтра" или "пз", "вчера" или "в" - Получение расписания занятий на заданый день\n
        - "обновить" - обновить свой данные\n
        - "подписаться" или "отписаться" - подписка или отписка от ежедневой рассылки расписания занятий. (в 19:00 по Москве)
    `)
})

/**
 * Команда тестирования парсинга новостей
 **/
studyBot.command('parse', ['/parse'], async (ctx: Context) => {

    const parser = new RSSParser('http://www.edu.ru/news/glavnye-novosti/feed.rss')
    const result = await parser.getData()
    const currentDate = new Luxon()

    result.items.forEach(item => {
        const dateItem = new Luxon("Asia/Yekaterinburg", DateTime.fromISO(item.isoDate))

        if (currentDate.local.hasSame(dateItem.local, 'day')) {

            ctx.send({message: item.title + "\n\n" + item.content + "\n\n" + item.link})

        }
    })

})
