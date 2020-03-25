import {server} from "../Server";
import {getRepository} from "typeorm";
import {User} from "../../database/entity/user"



// GET - By Name OR ID OR ALL Users
server.restify.get('/api/user', async (req, res, next) => {
    let where = []

    if (req.query) where.push(req.query)

    let userRepository = await getRepository(User)

    let json = await userRepository.find({
        where: where,
        relations: ["college"]
    })

    await res.json(json || [])
    return next()
})

// POST - Add user
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

    } catch (err) {

        console.error(err)
        res.json(typeof err == "object" ? err : {error: err})

    }

    return next()
})