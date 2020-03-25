import {server} from "../Server";
import {getCustomRepository, getRepository, Like} from "typeorm";
import {City} from "../../core/orm/models/City";
import {CityRepository} from "../../core/orm/repositories/CityRepository";

/**
 * GET обработчик на получение списка городов
 * @param req.query - который содержит в себе параметры для фильтрации выдаваемой информации
 * @returns Возвращяет массив с городами
 * @beta
 **/
server.restify.get('/api/city', async (req, res, next) => {
    try {

        const where = []

        if (req.query.name) where.push({name: Like(`%${req.query.name}%`)})
        if (req.query) where.push(req.query)

        const cityRepository = await getRepository(City)

        return res.json(await cityRepository.find({ where: where }))

    } catch (error) {

        return res.json({error})

    }
})

/**
 * Создание нового города
 * @param req.body - который содержит в себе данные для создания города
 * @returns Возвращяет созданный город
 **/
server.restify.post('/api/city', async (req, res, next) => {
    try {

        const cityRepository = await getCustomRepository(CityRepository)
        const city = await cityRepository.search({ where: { name: req.body.name } })

        if (city.length > 0) throw { name: "SyntaxError", message: "The record already exists in the orm." }

        return res.json(await cityRepository.create(req.body))

    } catch (error) {

        return res.json({error})

    }
})



/**
 * DELETE обработчик на удаление города
 * @param req.query - который содержит в себе условия для поиска
 * @returns В случае успеха, возвращяет город, что был удалён
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