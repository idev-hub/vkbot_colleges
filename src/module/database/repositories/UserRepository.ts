import {AbstractRepository, EntityRepository, FindConditions} from "typeorm";
import {User} from "../entities/User";

@EntityRepository(User)
export class UserRepository extends AbstractRepository<User> {

    /**
     * Поиск существ
     **/
    public search = async function (conditions: FindConditions<User> = {}): Promise<Array<User>> {
        return this.manager.find(User, conditions);
    }

    /**
     * Поиск существа
     **/
    public find = async function (conditions: FindConditions<User> = {}): Promise<User> {
        return this.manager.findOne(User, {
            where: conditions,
            relations: ['college']
        });
    }

    /**
     * Удаление существа
     **/
    public remove = async function (conditions: FindConditions<User>): Promise<User> {
        const user = await this.manager.findOne(User, conditions)
        return this.manager.remove(User, user)
    }

    /**
     * Создание нового существа
     **/
    public create = async function (body: FindConditions<User>): Promise<User> {
        const user = new User()

        Object.keys(body).map((key) => {
            user[key] = body[key]
        })

        return this.manager.save(user)
    }

    /**
     * Обновление существа
     **/
    public update = async function (user: User, body: FindConditions<User>): Promise<User> {
        const update = new User()

        Object.keys(body).map((key) => {
            update[key] = body[key]
        })

        return this.manager.update(User, user, update)
    }

    /**
     * Обновляет существо. Если существа не существует, то создает его
     **/
    public createOrUpdate = async function (body: FindConditions<User>): Promise<User> {

        const user = await this.manager.findOne(User, {where: {peerId: body.peerId}})
        if (user) {
            const update = new User()

            Object.keys(body).map((key) => {
                update[key] = body[key]
            })

            return this.manager.update(User, user, update)
        } else {
            const user = new User()

            Object.keys(body).map((key) => {
                user[key] = body[key]
            })

            return this.manager.save(user)
        }

    }

}