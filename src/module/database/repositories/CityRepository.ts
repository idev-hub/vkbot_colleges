import {AbstractRepository, EntityRepository, FindConditions} from "typeorm";
import {City} from "../entities/City";

@EntityRepository(City)
export class CityRepository extends AbstractRepository<City> {

    /**
     * Поиск существ
     **/
    public search = async function (conditions: FindConditions<City> = {}): Promise<Array<City>> {
        return this.manager.find(City, conditions);
    }

    /**
     * Поиск существа
     **/
    public find = async function (conditions: FindConditions<City> = {}): Promise<City> {
        return this.manager.findOne(City, conditions);
    }

    /**
     * Удаление существа
     **/
    public remove = async function (conditions: FindConditions<City>): Promise<City> {
        const city = await this.manager.findOne(City, conditions)
        return this.manager.remove(City, city)
    }

    /**
     * Создание нового существа
     **/
    public create = async function (body: FindConditions<City>): Promise<City> {
        const city = new City()

        Object.keys(body).map((key) => {
            city[key] = body[key]
        })

        return this.manager.save(city)
    }

    /**
     * Обновление существа
     **/
    public update = async function (city: City, body: FindConditions<City>): Promise<City> {
        const update = new City()

        Object.keys(body).map((key) => {
            update[key] = body[key]
        })

        return this.manager.update(City, city, update)
    }

    /**
     * Обновляет существо. Если существа не существует, то создает его
     **/
    public createOrUpdate = async function (body: FindConditions<City>): Promise<City> {

        const city = await this.manager.findOne(City, {where: {name: body.name}})
        if(city){
            const update = new City()

            Object.keys(body).map((key) => {
                update[key] = body[key]
            })

            return this.manager.update(City, city, update)
        } else {
            const city = new City()

            Object.keys(body).map((key) => {
                city[key] = body[key]
            })

            return this.manager.save(city)
        }

    }

}