import {server} from "../Server";
import {getRepository, Like} from "typeorm";
import {College} from "../../core/orm/models/College";
import Typify from "../../utils/Typify";
import axios from "axios"


/**
 * GET запрос на получение учебных учреждений
 * @param req.query - который содержит в себе параметры для фильтрации выдаваемой информации
 * @returns Возвращяет массив с информацией о учебных учреждениях
 * @beta
 **/
server.restify.get('/api/college', async (req, res, next) => {
    let where = []

    if (req.query.name) where.push({name: Like(`%${req.query.name}%`)})
    if (req.query) where.push(req.query)

    let collegeRepository = await getRepository(College)

    let json: any = await collegeRepository.find({
        where: where
    })

    await res.json(json)
    return next()
})

/**
 * GET запрос на получение расписания занятий
 * @param req.query - который содержит в себе параметры о текущем пользователе и дате
 * @returns Возвращяет типизированый массив полученных дисциплин
 * @beta
 **/
server.restify.get('/api/timetable', async (req, res, next) => {
    if (!req.query.user) throw "Не передана информация о пользователе"
    if (!req.query.date) throw "Не передана дата"

    const user = JSON.parse(req.query.user)
    const date = req.query.date
    const result = user.college.params.type === "jsonParse" ? await jsonParse(user, date) : await bodyParse(user, date)
    await res.json(result)

    return next()
})


/**
 * Функция на получение расписания занятий через метод REST API к источнику
 * @param user - содержит всю информацию о пользователе
 * @param date - строка с датой
 * @returns Возвращяет типизированый массив полученных дисциплин
 * @beta
 **/
const jsonParse = async (user, date: string) => {

    let schemeParams = user.college.params.scheme.params

    let params = {}
    for (let param in schemeParams) {
        if (schemeParams[param] === "d") params[param] = date
        else if (schemeParams[param] === "g") params[param] = user.group
    }

    const json = await axios({
        method: user.college.params.scheme.method,
        url: user.college.params.api,
        params: params,
        responseType: 'json'
    })

    if (!json.data) return null
    return new Typify(json.data, user.college.params.scheme.toJson).typifyJson()

}

const bodyParse = async (user, date) => {
    return null
}