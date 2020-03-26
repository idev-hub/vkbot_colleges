import axios from 'axios'
import configs from "../../../configs";
import {College} from "../../../core/orm/models/College";

/**
 * Отправляет запрос по внутренему серверу для получения списка учебных учреждений
 * @param _params {object} Условия выборки
 * @returns {Promise<Array<College>>} Массив с учебными учреждениями
 **/
export const getCollege = async (_params: object = {}): Promise<Array<College>> => {
    try {
        const res = await axios.get(`${configs.database.uri}/api/college`, {
            params: _params
        })
        return res.data
    } catch (err) {
        return err
    }
}

/**
 * Отправляет запрос по внутренему серверу для получения расписания занятий
 * @param _params {object} Входные данные
 * @returns {Promise<string>} Преобразованное в строку расписание
 **/
export const getTimetable = async (_params: object = {}):Promise<string> => {
    try {
        const res = await axios.get(`${configs.database.uri}/api/timetable`, {
            params: _params
        })
        if (res.data) return toMessageTimetable(res.data)

        return "- Я не смог найти расписание на этот день."
    } catch (err) {
        return err
    }
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
            if (key === "number") msg += "Номер занятия: " + _obj["number"] + "\n"
            if (key === "teacher") msg += "Преподователь: " + _obj["teacher"] + "\n"
            if (key === "location") msg += "Местоположение: " + _obj["location"] + "\n"
            if (key === "discipline") msg += "Дисциплина: " + _obj["discipline"] + "\n"
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