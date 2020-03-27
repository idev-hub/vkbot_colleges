import {getCustomRepository, getRepository, Like} from "typeorm";
import {College} from "../../database/entities/College";
import Typify from "../../../utils/Typify";
import axios from "axios"
import {User} from "../../database/entities/User";
import {server} from "../index";
import {CollegeRepository} from "../../database/repositories/CollegeRepository";


/**
 * GET запрос на получение расписания занятий
 **/
server.restify.get('/api/timetable', async (req, res) => {

    if (!req.query.user) throw {name: "SyntaxError", message: "Не передана информация о пользователе"}
    if (!req.query.date) throw {name: "SyntaxError", message: "Не передана дата"}

    const user = JSON.parse(req.query.user)
    const date = req.query.date
    const result = user.college.params.type === "jsonParse" ? await jsonParse(user, date) : await bodyParse(user, date)
    return res.json(result)

})

/**
 * Функция получение расписания занятий через API к источнику
 * @param user {User} - Пользователь
 * @param date {string} - Дата
 * @returns {Promise<Array<object>>} Массив расписания учебного учреждения
 **/
const jsonParse = async (user: User, date: string): Promise<Array<object>> => {

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

const bodyParse = async (user, date) => {
    return null
}