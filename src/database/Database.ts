import {Connection, createConnection, getCustomRepository, getConnectionOptions} from "typeorm";
import {CityRepository} from "./repository/cityRepository";
import {CollegeRepository} from "./repository/collegeRepository";
import {Keyboard} from "vk-io";

class Database {

    public connection: Connection;

    public connect = async () => {

        try {
            this.connection = await createConnection()

            let {dropSchema, synchronize} = await getConnectionOptions()
            if(dropSchema && synchronize){

                let cityRepository = await getCustomRepository(CityRepository)
                let chelyabinsk = await cityRepository.createAndSave("Челябинск")

                let collegeRepository = await getCustomRepository(CollegeRepository)
                await collegeRepository.createAndSave("ЧГПГТ им. А.В Яковлева", "chgpgt.ru", chelyabinsk, {
                    type: "jsonParse",
                    api: 'http://www.chgpgt.ru/systems/raspisanieapi.html',
                    keyboards: [
                        [
                            Keyboard.textButton({
                                label: 'Вчера',
                                payload: { command: 'yesterday' },
                                color: Keyboard.NEGATIVE_COLOR
                            }),
                            Keyboard.textButton({
                                label: 'Сегодня',
                                payload: { command: 'today' },
                                color: Keyboard.PRIMARY_COLOR
                            }),
                            Keyboard.textButton({
                                label: 'Завтра',
                                payload: { command: 'tomorrow' },
                                color: Keyboard.POSITIVE_COLOR
                            })
                        ],
                        [
                            Keyboard.textButton({
                                label: 'Послезавтра',
                                payload: { command: 'afterTomorrow' },
                                color: Keyboard.POSITIVE_COLOR
                            }),
                            Keyboard.textButton({
                                label: 'Настройки',
                                payload: { command: 'settings' },
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
                })
                await collegeRepository.createAndSave("Южно-Уральский государственный колледж", "ecol.edu.ru", chelyabinsk, {
                    type: "bodyParse",
                    api: '',
                    keyboards: [],
                    scheme: {}
                })

            }
        } catch (err) {
            console.error(err)
        }
    }
}

export const database = new Database();