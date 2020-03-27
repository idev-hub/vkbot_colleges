import {AbstractRepository, EntityRepository, FindConditions} from "typeorm";
import {College} from "../entities/College";

@EntityRepository(College)
export class CollegeRepository extends AbstractRepository<College> {

    /**
     * Поиск существ
     **/
    public search = async function (conditions: FindConditions<College> = {}): Promise<Array<College>> {
        return this.manager.find(College, conditions);
    }

    /**
     * Поиск существа
     **/
    public find = async function (conditions: FindConditions<College> = {}): Promise<College> {
        return this.manager.findOne(College, conditions);
    }

    /**
     * Удаление существа
     **/
    public remove = async function (conditions: FindConditions<College>): Promise<College> {
        const college = await this.manager.findOne(College, conditions)
        return this.manager.remove(College, college)
    }

    /**
     * Создание нового существа
     **/
    public create = async function (body: FindConditions<College>): Promise<College> {
        const college = new College()

        Object.keys(body).map((key) => {
            college[key] = body[key]
        })

        return this.manager.save(college)
    }

    /**
     * Обновление существа
     **/
    public update = async function (college: College, body: FindConditions<College>): Promise<College> {
        const update = new College()

        Object.keys(body).map((key) => {
            update[key] = body[key]
        })

        return this.manager.update(College, college, update)
    }

    /**
     * Обновляет существо. Если существа не существует, то создает его
     **/
    public createOrUpdate = async function (body: FindConditions<College>): Promise<College> {

        const college = await this.manager.findOne(College, {where: {name: body.name}})
        if (college) {
            const update = new College()

            Object.keys(body).map((key) => {
                update[key] = body[key]
            })

            return this.manager.update(College, college, update)
        } else {
            const college = new College()

            Object.keys(body).map((key) => {
                college[key] = body[key]
            })

            return this.manager.save(college)
        }

    }

}