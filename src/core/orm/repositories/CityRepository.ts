import {City} from "../models/City";
import {AbstractRepository, EntityRepository} from "typeorm";

@EntityRepository(City)
export class CityRepository extends AbstractRepository<City> {

    /**
     * Выполняет поиск городов по заданым опциям
     * @param _options {object} Опции поиска
     * @returns {Promise<Array<City>>} Массив с городами
     **/
    public search = (_options: object): Promise<Array<City>> => this.manager.find(City, _options)

    /**
     * Выполняет удаление города по заданым опциям
     * @param _options {object} Опции условия
     * @returns {Promise<object>} Удаленный город
     **/
    public remove = async (_options: object): Promise<object> => {
        const city = await this.manager.findOne(City, _options)
        return await this.manager.remove(City, city)
    }

    /**
     * Выполняет создание нового города по переданому телу
     * @param _body {object} Тело, данные города
     * @returns {Promise<City>} Созданный город
     **/
    public create = (_body: object): Promise<City> => {
        const city = new City()
        city.name = _body["name"]
        return this.manager.save(city)
    }

}