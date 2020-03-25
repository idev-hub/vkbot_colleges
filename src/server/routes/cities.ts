import {server} from "../Server";
import {getRepository, Like} from "typeorm";
import {City} from "../../database/entity/city";

// GET - By Name OR ID OR ALL Cities
server.restify.get('/api/city', async (req, res, next) => {
    let where = []

    if (req.query.name) where.push({name: Like(`%${req.query.name}%`)})
    if (req.query) where.push(req.query)

    let cityRepository = await getRepository(City)

    let json = await cityRepository.find({
        where: where
    })

    await res.json(json || [])
    return next()
})


// POST - Add city
server.restify.post('/api/city', async (req, res, next) => {

    try {

        let cityRepository = await getRepository(City)

        const city = await cityRepository.find({
            where: {
                name: req.body.name
            }
        })
        if (city.length > 0) {
            throw "Запись уже существует в базе данных"
        } else {
            const newCity = await cityRepository.create(req.body)
            res.json(await cityRepository.save(newCity))
        }

    } catch (err) {
        console.error(err)
        res.json(typeof err == "object"?err:{error: err})
    }

    return next()

})