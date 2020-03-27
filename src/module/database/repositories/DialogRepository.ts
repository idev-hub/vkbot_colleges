import {AbstractRepository, EntityRepository, FindConditions} from "typeorm";
import {Dialog} from "../entities/Dialog";

@EntityRepository(Dialog)
export class DialogRepository extends AbstractRepository<Dialog> {

    /**
     * Поиск существ
     **/
    public search = async function (conditions: FindConditions<Dialog> = {}): Promise<Array<Dialog>> {
        return this.manager.find(Dialog, {
            where: conditions,
            relations: ['user', 'companion']
        });
    }

    /**
     * Поиск существа
     **/
    public find = async function (conditions: FindConditions<Dialog> = {}): Promise<Dialog> {
        return this.manager.findOne(Dialog, {
            where: conditions,
            relations: ['user', 'companion']
        });
    }

    /**
     * Удаление существа
     **/
    public remove = async function (conditions: FindConditions<Dialog>): Promise<Dialog> {
        const dialog = await this.manager.findOne(Dialog, conditions)
        return this.manager.remove(Dialog, dialog)
    }

    /**
     * Создание нового существа
     **/
    public create = async function (body: FindConditions<Dialog>): Promise<Dialog> {
        const dialog = new Dialog()

        Object.keys(body).map((key) => {
            dialog[key] = body[key]
        })

        return this.manager.save(dialog)
    }

    /**
     * Обновление существа
     **/
    public update = async function (dialog: Dialog, body: FindConditions<Dialog>): Promise<Dialog> {
        const update = new Dialog()

        Object.keys(body).map((key) => {
            update[key] = body[key]
        })

        return this.manager.update(Dialog, dialog, update)
    }

    /**
     * Обновляет существо. Если существа не существует, то создает его
     **/
    public createOrUpdate = async function (body: FindConditions<Dialog>): Promise<Dialog> {

        const dialog = await this.manager.findOne(Dialog, {where: {user: body.user}})
        if (dialog) {
            const update = new Dialog()

            Object.keys(body).map((key) => {
                update[key] = body[key]
            })

            return this.manager.update(Dialog, dialog, update)
        } else {
            const dialog = new Dialog()

            Object.keys(body).map((key) => {
                dialog[key] = body[key]
            })

            return this.manager.save(dialog)
        }

    }

}