import {AbstractRepository, EntityRepository, UpdateResult} from "typeorm";
import {User} from "../models/User";

@EntityRepository(User)
export class UserRepository extends AbstractRepository<User> {

    /**
     * Поиск существ
     * @param _options {object} Опции
     * @returns {Promise<Array<object>>} Наиденные существа
     **/
    public search = async (_options: object): Promise<Array<User>> => await this.manager.find(User, _options)

    /**
     * Поиск существа
     * @param _options {object} Опции
     * @returns {Promise<object>} Наиденное существо
     **/
    public find = async (_options: object): Promise<User> => await this.manager.findOne(User, _options)

    /**
     * Удаление существа
     * @param _options {object} Опции
     * @returns {Promise<object>} Удаленное существо
     **/
    public remove = async (_options: object): Promise<object> => {

        const user = await this.manager.findOne(User, _options)
        return await this.manager.remove(User, user)

    }

    /**
     * Создание нового существа
     * @param _body {object} Данные создаваемого существа
     * @returns {Promise<object>} Созданное существо
     **/
    public create = async (_body: object): Promise<User> => {

        const user = new User()

        Object.keys(_body).map((key) => {
            user[key] = _body[key]
        })

        return await this.manager.save(user)

    }


    /**
     * Обновление данных существа
     * @param _object {object} Опции
     * @param _body {object} Данные существа
     * @returns {Promise<UpdateResult>} Обновленное существо
     **/
    public update = async (_object: User, _body: object): Promise<UpdateResult> => {

        const updateUser = new User()

        Object.keys(_body).map((key) => {
            updateUser[key] = _body[key]
        })

        return await this.manager.update(User, _object.id, updateUser)

    }

}