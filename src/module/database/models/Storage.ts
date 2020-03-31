import {Connection, createConnection, getConnectionOptions, getCustomRepository} from "typeorm";
import {CollegeRepository} from "../repositories/CollegeRepository";
import {Keyboard} from "vk-io";
import {CityRepository} from "../repositories/CityRepository";

export default class Storage {

    public connection: Connection;

    /**
     * Создание таблиц базы данных и первичных записей. Запуск самой базы данных.
     **/
    public connect = async () => {
        try {

            this.connection = await createConnection()

            let {dropSchema, synchronize} = await getConnectionOptions()
            if (dropSchema && synchronize) {

                let cityRepository = await getCustomRepository(CityRepository)
                let chelyabinsk = await cityRepository.create({name: "Челябинск"})

                let collegeRepository = await getCustomRepository(CollegeRepository)

                await collegeRepository.create({
                    name: "ЧГПГТ им. А.В Яковлева",
                    uri: "chgpgt.ru",
                    city: chelyabinsk,
                    params: {
                        type: "jsonParse",
                        api: 'http://www.chgpgt.ru/systems/raspisanieapi.html',
                        keyboards: [
                            [
                                Keyboard.textButton({
                                    label: 'Вчера',
                                    payload: {command: 'yesterday'},
                                    color: Keyboard.NEGATIVE_COLOR
                                }),
                                Keyboard.textButton({
                                    label: 'Сегодня',
                                    payload: {command: 'today'},
                                    color: Keyboard.PRIMARY_COLOR
                                }),
                                Keyboard.textButton({
                                    label: 'Завтра',
                                    payload: {command: 'tomorrow'},
                                    color: Keyboard.POSITIVE_COLOR
                                })
                            ],
                            [
                                Keyboard.textButton({
                                    label: 'Послезавтра',
                                    payload: {command: 'after-tomorrow'},
                                    color: Keyboard.POSITIVE_COLOR
                                }),
                                Keyboard.textButton({
                                    label: 'Еще',
                                    payload: {command: 'to-more'},
                                    color: Keyboard.NEGATIVE_COLOR
                                })
                            ]
                        ],
                        scheme: {
                            method: 'GET',
                            params: {
                                dates: 'd',
                                groups: 'g'
                            },
                            toJson: {
                                number: 0,
                                discipline: 1,
                                teacher: 2,
                                location: 3,
                            }
                        }
                    }
                })

            }

        } catch (error) {

            console.error({error})

        }
    }
}