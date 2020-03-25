import {City} from "../entity/city";
import {AbstractRepository, EntityRepository} from "typeorm";

@EntityRepository(City)
export class CityRepository extends AbstractRepository<City> {


    createAndSave(_name: string) {
        const city = new City();
        city.name = _name;
        return this.manager.save(city);
    }
}