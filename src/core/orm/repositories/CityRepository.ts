import {City} from "../models/City";
import {AbstractRepository, EntityRepository} from "typeorm";

@EntityRepository(City)
export class CityRepository extends AbstractRepository<City> {

    public search = (_options: object): Promise<Array<City>> => this.manager.find(City, _options)
    public remove = async (_options: object): Promise<object> => {
        const user = await this.manager.findOne(City, _options)
        return await this.manager.remove(City, user)
    }

    public create = (_body: object): Promise<City> => {
        const city = new City()
        city.name = _body["name"]
        return this.manager.save(city)
    }

}