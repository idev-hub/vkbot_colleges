import {Context, Keyboard} from "vk-io";
import {DateTime} from 'luxon';

import Command from "../models/Command";
import {bot} from "..";
import Luxon from "../../../utils/Luxon";
import {getTimetable} from "../services/colleges";
import {isLogin} from "../services/users";
import RSSParser from "../../../utils/RSSParser";


/**
 * Шаблон для комманды расписания
 * @param ctx {Context}
 * @param date {Luxon}
 * @returns {Promise<string>}
 **/
const timetableTemplate = async (ctx: Context, date: Luxon = new Luxon()): Promise<string> => {
    const {user} = ctx.session

    return (date.week() !== 7) ? await getTimetable({
        user: user,
        date: date.pin(),
    }) : "- Сегодня выходной день, расписания нет."
}


/**
 * Команда получения расписания за ВЧЕРА
 **/
new Command(bot, 'yesterday', ['вчера', 'Вчера', 'в'], async (ctx: Context) => {
    let date = new Luxon().subtract(24)
    const template = await timetableTemplate(ctx, date)

    return ctx.send({
        message: `Расписание на "Вчера" - "${date.pin()}" для группы "${ctx.session.user.group}"\n\n${template}`,
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
new Command(bot, 'today', ['сегодня', 'Сегодня', 'с'], async (ctx: Context) => {
    let date = new Luxon()
    const template = await timetableTemplate(ctx, date)

    return ctx.send({
        message: `Расписание на "Сегодня" - "${date.pin()}" для группы "${ctx.session.user.group}"\n\n${template}`,
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
new Command(bot, 'tomorrow', ['завтра', 'Завтра', 'з'], async (ctx: Context) => {
    let date = new Luxon().add(24)
    const template = await timetableTemplate(ctx, date)

    return ctx.send({
        message: `Расписание на "Завтра" - "${date.pin()}" для группы "${ctx.session.user.group}"\n\n${template}`,
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
new Command(bot, 'afterTomorrow', ['послезавтра', 'Послезавтра', 'пз'], async (ctx: Context) => {
    let date = new Luxon().add(48)
    const template = await timetableTemplate(ctx, date)

    return ctx.send({
        message: `Расписание на "Послезавтра" - "${date.pin()}" для группы "${ctx.session.user.group}"\n\n${template}`,
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
 * Команда перехода на сцену с регистрацией ( работает как функция обновления и создания данных о пользователе )
 **/
new Command(bot, 'register', ['/update'], (ctx: Context) => ctx.scene.enter('registerScene'))


/**
 * Команда перехода на сцену с настройками пользователя
 **/
new Command(bot, 'settings', ['/settings'], (ctx: Context) => ctx.scene.enter('settingsScene'))


/**
 * Команда выхода из всех сцен
 **/
new Command(bot, 'to-main', ['/main'], async (ctx: Context) => {
    await ctx.scene.leave()

    let user = await isLogin(ctx)
    let keyboard = []
    if (user) keyboard = await user.college["params"]["keyboards"]

    return ctx.send({
        message: 'Вы вернулись на главную страницу',
        keyboard: Keyboard.keyboard(keyboard)
    })
})


/**
 * Команда тестирования парсинга новостей
 **/
new Command(bot, 'parse', ['/parse'], async (ctx: Context) => {

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


/**
 * Команда тестирования
 **/
new Command(bot, 'search-companion', ['/search'], (ctx: Context) => {

    return ctx.send({
        message: "Идёт поиск себеседника..."
    })

})