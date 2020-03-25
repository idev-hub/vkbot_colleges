import {server} from "../Server";
import {getCustomRepository, getRepository, Like} from "typeorm";
import {City} from "../../core/orm/models/City";
import {CityRepository} from "../../core/orm/repositories/CityRepository";

/**
 * GET обработчик на получение списка городов
 **/
server.restify.get('/api/city', async (req, res, next) => {
    try {

        const where = []

        if (req.query.name) where.push({name: Like(`%${req.query.name}%`)})
        if (req.query) where.push(req.query)

        const cityRepository = await getRepository(City)

        return res.json(await cityRepository.find({where: where}))

    } catch (error) {

        return res.json({error})

    }
})

/**
 * Создание нового города
 **/
server.restify.post('/api/city', async (req, res, next) => {
    try {

        const cityRepository = await getCustomRepository(CityRepository)
        const city = await cityRepository.search({where: {name: req.body.name}})

        if (city.length > 0) throw {name: "SyntaxError", message: "The record already exists in the orm."}

        return res.json(await cityRepository.create(req.body))

    } catch (error) {

        return res.json({error})

    }
})

/**
 * DELETE обработчик на удаление города
 **/
server.restify.del('/api/city', async (req, res, next) => {
    try {

        const cityRepository = await getCustomRepository(CityRepository)
        return res.json(await cityRepository.remove({
            where: req.query
        }))

    } catch (error) {

        return res.json({error})

    }
})