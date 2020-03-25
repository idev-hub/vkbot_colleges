import {server} from "../Server";
import {getRepository, Like} from "typeorm";
import {College} from "../../database/entity/college";
import {typify} from "../../utils/typify";
import axios from "axios"


// GET By Name OR ID OR ALL Colleges
server.restify.get('/api/college', async (req, res, next) => {
    let where = []

    if (req.query.name) where.push({name: Like(`%${req.query.name}%`)})
    if (req.query) where.push(req.query)

    let collegeRepository = await getRepository(College)

    let json = await collegeRepository.find({
        where: where
    })

    await res.json(json || [])
    return next()
})

// GET Timetable
server.restify.get('/api/timetable', async (req, res, next) => {

    if (!req.query.user) throw "Не передана информация о пользователе"
    if (!req.query.date) throw "Не передана дата"

    const user = JSON.parse(req.query.user)
    const date = req.query.date
    let result = user.college.params.type === "jsonParse"? await jsonParse(user, date) : await bodyParse(user, date)

    await res.json(result)

    return next()
})


const jsonParse = async (user, date) => {

    let schemeParams = user.college.params.scheme.params

    let params = {}
    for (let param in schemeParams){

        if(schemeParams[param] === "d") params[param] = date
        else if(schemeParams[param] === "g") params[param] = user.group
    }

    const json = await axios({
        method: user.college.params.scheme.method,
        url: user.college.params.api,
        params: params,
        responseType: 'json'
    })
    if(json.data) return typify(json.data, user.college.params.scheme.toJson)
    return null
}

const bodyParse = async (user, date) => {
    return null
}