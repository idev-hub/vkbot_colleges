import {College} from "../models/College"
import {AbstractRepository, EntityRepository} from "typeorm"

@EntityRepository(College)
export class CollegeRepository extends AbstractRepository<College> {

    /**
     * Выполняет поиск учебных учреждений по заданым опциям
     * @param _options {object} Опции поиска
     * @returns {Promise<Array<City>>} Возвращяет массив с учебными учреждениями
     **/
    public search = (_options: object): Promise<Array<College>> => this.manager.find(College, _options)

    /**
     * Выполняет удаление учебного учреждения по заданым опциям
     * @param _options {object} Опции условия
     * @returns {Promise<object>} Удаленное учебное учреждение
     **/
    public remove = async (_options: object): Promise<object> => {
        const college = await this.manager.findOne(College, _options)
        return await this.manager.remove(College, college)
    }

    /**
     * Выполняет создание нового учебного учреждения по переданому телу
     * @param _body {object} Тело, данные учебного учреждения
     * @returns {Promise<City>} Созданное учебное учреждение
     **/
    public create = (_body: object): Promise<College> => {
        const college = new College()
        college.name = _body["name"]
        college.city = _body["city"]
        college.uri = _body["uri"]
        college.params = _body["params"]
        return this.manager.save(college)
    }

}