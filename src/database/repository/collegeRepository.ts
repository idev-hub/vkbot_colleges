import {College} from "../entity/college"
import {AbstractRepository, EntityRepository} from "typeorm"
import {City} from "../entity/city"

@EntityRepository(College)
export class CollegeRepository extends AbstractRepository<College> {

    createAndSave(_name: string, _uri: string, _city: City, _params: object) {
        const college = new College()
        college.name = _name
        college.city = _city
        college.uri = _uri
        college.params = _params
        return this.manager.save(college)
    }
}