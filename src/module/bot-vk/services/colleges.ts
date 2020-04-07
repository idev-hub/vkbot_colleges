import axios from 'axios'
import Typify from "../../../utils/Typify";
import {User} from "../../database/entities/User";
import {ETypeParse} from "../../database/entities/College";
import {Context} from "vk-io";
import Luxon from "../../../utils/Luxon";

/**
 * Функция получение расписания занятий через API к источнику
 * @param user {User} - Пользователь
 * @param date {string} - Дата
 * @returns {Promise<Array<object>>} Массив расписания учебного учреждения
 **/
export const jsonParse = async (user: User, date: string) => {
    const scheme = user['college']['params']['scheme']['params']
    const params = {}

    Object.keys(scheme).map((param) => {
        if (scheme[param] === "d") params[param] = date
        else if (scheme[param] === "g") params[param] = user.group
    })

    const json = await axios({
        method: user['college']['params']['scheme']['method'],
        url: user['college']['params']['api'],
        params: params,
        responseType: 'json'
    })

    if (!json.data) return null
    return new Typify(json.data, user['college']['params']['scheme']['toJson']).typifyJson()
}

export const bodyParse = async (user: User, date: string) => {
    return null
}


/**
 * Получение расписания
 * @returns {Promise<string>} Преобразованное в строку расписание
 * @param user
 * @param date
 **/
export const getTimetable = async (user: User, date: string):Promise<string> => {
    const result = user.college.params.type === ETypeParse.jsonParse ? await jsonParse(user, date) : await bodyParse(user, date)

    if(!result) return "- Я не смог найти расписание на этот день."
    return toMessageTimetable(result)
}

/**
 * Преобразует объект в тип строка
 * @param _object {object} - Объект с расписанием
 * @returns {string} Преобразованное в строку расписание
 * @beta
 **/
export const toMessageTimetable = (_object: object): string => {
    const tp = (_obj): string => {
        let msg = ""
        for (let key in _obj) {
            if (key === "number" && (_obj["number"] !== "" && _obj["number"] !== null && _obj["number"] !== undefined)) msg += "Номер занятия: " + _obj["number"] + "\n"
            if (key === "teacher" && (_obj["teacher"] !== "" && _obj["teacher"] !== null && _obj["teacher"] !== undefined)) msg += "Преподователь: " + _obj["teacher"] + "\n"
            if (key === "location" && (_obj["location"] !== "" && _obj["location"] !== null && _obj["location"] !== undefined)) msg += "Местоположение: " + _obj["location"] + "\n"
            if (key === "discipline" && (_obj["discipline"] !== "" && _obj["discipline"] !== null && _obj["discipline"] !== undefined)) msg += "Дисциплина: " + _obj["discipline"] + "\n"
        }
        return msg || null
    }

    if (Array.isArray(_object)) {
        let message = ""
        for (let obj of _object) {
            message += tp(obj) + '\n\n'
        }
        return message
    } else {
        return tp(_object)
    }
}

/**
 * Получение готового к отправке расписания занятий
 * @param ctx {Context}
 * @param date {Luxon}
 * @returns {Promise<string>}
 **/
export const getCompleteTimetable = async (ctx: Context, date: Luxon = new Luxon()): Promise<string> => {
    const {user} = ctx.session
    return (date.week() !== 7) ? await getTimetable(user, date.pin()) : "- Этот день выходной, расписания нет."
}