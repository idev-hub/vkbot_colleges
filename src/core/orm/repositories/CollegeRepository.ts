import {College} from "../models/College";
import {AbstractRepository, EntityRepository, UpdateResult} from "typeorm";

@EntityRepository(College)
export class CollegeRepository extends AbstractRepository<College> {

    /**
     * Поиск существ
     * @param _options {object} Опции
     * @returns {Promise<Array<object>>} Наиденные существа
     **/
    public search = async (_options: object): Promise<Array<College>> => await this.manager.find(College, _options)

    /**
     * Поиск существа
     * @param _options {object} Опции
     * @returns {Promise<object>} Наиденное существо
     **/
    public find = async (_options: object): Promise<College> => await this.manager.findOne(College, _options)

    /**
     * Удаление существа
     * @param _options {object} Опции
     * @returns {Promise<object>} Удаленное существо
     **/
    public remove = async (_options: object): Promise<object> => {

        const college = await this.manager.findOne(College, _options)
        return await this.manager.remove(College, college)

    }

    /**
     * Создание нового существа
     * @param _body {object} Данные создаваемого существа
     * @returns {Promise<object>} Созданное существо
     **/
    public create = async (_body: object): Promise<College> => {

        const college = new College()

        Object.keys(_body).map((key) => {
            college[key] = _body[key]
        })

        return await this.manager.save(college)

    }

    /**
     * Обновление данных существа
     * @param _object {object} Опции
     * @param _body {object} Данные существа
     * @returns {Promise<UpdateResult>} Обновленное существо
     **/
    public update = async (_object: College, _body: object): Promise<UpdateResult> => {

        const updateCollege = new College()

        Object.keys(_body).map((key) => {
            updateCollege[key] = _body[key]
        })

        return await this.manager.update(College, _object.id, updateCollege)

    }

}