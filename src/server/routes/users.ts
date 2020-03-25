import {server} from "../Server";
import {getRepository} from "typeorm";
import {User} from "../../core/orm/models/User"


/**
 * GET запрос на получение пользователя
 * @param req.query - который содержит в себе параметры для фильтрации выдаваемой информации
 * @returns Возвращяет массив с пользователя
 * @beta
 **/
server.restify.get('/api/user', async (req, res, next) => {
    let where = []

    if (req.query) where.push(req.query)

    let userRepository = await getRepository(User)

    let json = await userRepository.find({
        where: where,
        relations: ["college"]
    })

    await res.json({json})
    return next()
})

/**
 * POST запрос на создание нового пользователя ( если пользователь уже существует, то обновляет )
 * @param req.body - который содержит в себе данные для создания или обновления пользователя
 * @returns В случае успеха, возвращяет созданного/обновленного пользователя
 **/
server.restify.post('/api/user', async (req, res, next) => {

    try {

        let userRepository = await getRepository(User)

        let user = await userRepository.find({
            where: {
                peerId: req.body.peerId
            }
        })

        if (user.length > 0) {

            for (let key in req.body) {
                user[key] = req.body[key]
            }

            res.json(await userRepository.save(user))

        } else {

            const newUser = await userRepository.create(req.body)
            res.json(await userRepository.save(newUser))
        }

    } catch (error) {

        res.json({error})

    }

    return next()
})