import {Context, Keyboard} from "vk-io";
import {DateTime} from 'luxon';
import Command from "../models/Command";
import {bot} from "..";
import Luxon from "../../../utils/Luxon";
import {getTimetable} from "../services/colleges";
import RSSParser from "../../../utils/RSSParser";
import {getCustomRepository} from "typeorm";
import {DialogRepository} from "../../database/repositories/DialogRepository";


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
    }) : "- Этот день выходной, расписания нет."
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
new Command(bot, 'after-tomorrow', ['послезавтра', 'Послезавтра', 'пз'], async (ctx: Context) => {
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
 * Команда перехода на сцену с расписанием занятий
 **/
new Command(bot, 'to-timetable', ['/main'], async (ctx: Context) => ctx.scene.enter('timetable-scene'))


/**
 * Команда перехода на сцену с регистрацией ( работает как функция обновления и создания данных о пользователе )
 **/
new Command(bot, 'register', ['/update'], (ctx: Context) => ctx.scene.enter('register-scene'))


/**
 * Команда перехода на сцену с настройками пользователя
 **/
new Command(bot, 'to-settings', ['/settings'], (ctx: Context) => ctx.scene.enter('settings-scene'))





/**
 * Команда перехода на сцену с доп. функционалом
 **/
new Command(bot, 'to-more', ['/more'], (ctx: Context) => ctx.scene.enter('more-scene'))


/**
 * Команда перехода на сцену с погодой
 **/
new Command(bot, 'to-weather', ['/weather'], (ctx: Context) => ctx.scene.enter('weather-scene'))


/**
 * Команды чата
 * @beta
 **/
new Command(bot, 'search-companion', ['/search'], (ctx: Context) => ctx.scene.enter('search-companion-scene'))
new Command(bot, 'chat-room', ['/room'], (ctx: Context) => ctx.scene.enter('chat-room-scene'))
new Command(bot, 'cancel-search-companion', ['/cancel-search-companion'], async (ctx: Context) => {
    const dialogRepository = await getCustomRepository(DialogRepository)

    await dialogRepository.createOrUpdate({user: ctx.session.user, companion: null, search: null})
    return ctx.scene.enter('search-companion-scene')
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
