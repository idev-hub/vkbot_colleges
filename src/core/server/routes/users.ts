import {server} from "../Server";
import {getCustomRepository, getRepository} from "typeorm";
import {UserRepository} from "../../orm/repositories/UserRepository";

/**
 * GET запрос на получение пользователя
 **/
server.restify.get('/api/user', async (req, res) => {
    try {

        let where = []

        if (req.query) where.push(req.query)

        let userRepository = await getCustomRepository(UserRepository)

        let json = await userRepository.search({
            where: where,
            relations: ["college"]
        })

        return res.json({json})

    } catch (error) {

        return res.json({error})

    }
})

/**
 * POST запрос на создание нового пользователя ( если пользователь уже существует, то обновляет )
 **/
server.restify.post('/api/user', async (req, res) => {

    try {

        let userRepository = await getCustomRepository(UserRepository)

        let user = await userRepository.find({
            where: {
                peerId: req.body.peerId
            }
        })

        if (user) return res.json(await userRepository.update(user, req.body)) // Если существует

        return res.json(await userRepository.create(req.body)) // Если не существует

    } catch (error) {

        return res.json({error})

    }

})