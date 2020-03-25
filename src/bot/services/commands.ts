import Command from "../models/Command"
import {Keyboard} from "vk-io";
import {isLogin} from "./users";
import {getTimetable} from "./colleges";
import Luxon from "../../utils/Luxon"


/**
 * Шаблон для комманды расписания
 * @param ctx - Контекст
 * @param date - Moment дата
 * @returns Возвращяет готовую строку отправляемую пользователю
 **/
const timetableTemplate = async (ctx, date: Luxon = new Luxon()) => {
    const {user} = ctx.session

    return (date.week() !== 7) ? await getTimetable({
        user: user,
        date: date.pin(),
    }) : "- Сегодня выходной день, расписания нет."
}


/**
 * Команда получения расписания за ВЧЕРА
 **/
new Command('yesterday', ['вчера', 'Вчера', 'в'], async (ctx) => {
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
new Command('today', ['сегодня', 'Сегодня', 'с'], async (ctx) => {
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
new Command('tomorrow', ['завтра', 'Завтра', 'з'], async (ctx) => {
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
new Command('afterTomorrow', ['послезавтра', 'Послезавтра', 'пз'], async (ctx) => {
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
new Command('register', ['/update'], (ctx) => ctx.scene.enter('registerScene'))


/**
 * Команда перехода на сцену с настройками пользователя
 **/
new Command('settings', ['/settings'], (ctx) => ctx.scene.enter('settingsScene'))


/**
 * Команда выхода из всех сцен
 **/
new Command('toMain', ['/main'], async (ctx) => {
    await ctx.scene.leave()

    let user = await isLogin(ctx)
    let keyboard = []
    if (user) keyboard = await user.college.params.keyboards

    return ctx.send({
        message: 'Вы вернулись на главную страницу',
        keyboard: Keyboard.keyboard(keyboard)
    })
})


