import {CronJob} from "cron";
import Luxon from "../../../utils/Luxon";
import {getCustomRepository} from "typeorm";
import {UserRepository} from "../../database/repositories/UserRepository";
import {studyBot} from "../index";
import {getTimetable} from "./colleges";
import {Keyboard} from "vk-io";

export const cron = new CronJob('0 0 19 * * *', async () => {

    const date: Luxon = new Luxon().add(24)
    const week: number = date.week()

    if (week !== 7) {

        const userRepository = await getCustomRepository(UserRepository)
        const users = await userRepository.search({block: false, autoLink: true})
        console.log(users)

        for (const user of users) {

            try {
                const template = await getTimetable({user: user, date: date.pin()})

                await studyBot.api.messages.send({
                    user_id: user.peerId,
                    message: `Расписание на "Завтра" - "${date.pin()}" для группы "${user.group}"\n\n${template} Это авторассылка, если вы не хотите больше получать подобные сообщения нажмите кнопку отписаться.`,
                    keyboard: Keyboard.keyboard([
                        [
                            Keyboard.textButton({
                                label: "&#128277; Отписаться",
                                payload: {
                                    command: "unsubscribe"
                                },
                                color: Keyboard.NEGATIVE_COLOR
                            }),
                            Keyboard.textButton({
                                label: "Послезавтра",
                                payload: {
                                    command: "after-tomorrow"
                                },
                                color: Keyboard.POSITIVE_COLOR
                            })
                        ]
                    ]).oneTime().inline()
                })
            } catch (error) {
                console.error({error})
            }

        }

    }

}, null, true, 'Europe/Moscow')


// export const status = new CronJob('*/30 * * * * *', async () => {
//
//     const userRepository = await getCustomRepository(UserRepository)
//     const dialogRepository = await getCustomRepository(DialogRepository)
//     const users = await userRepository.search()
//     const dialogs = await dialogRepository.search({search: 'communicate'})
//
//     const status = await studyBot.api.status.set({
//         text: `Пользователей: ${users.length} | Сейчас общаются: ${dialogs.length}`,
//         group_id: 122178863,
//         access_token: '4bf0a729c538cbbd7e11e7147c582b107a0435449f386c2953a176b43ba34af7d055bfe847275855b51ea'
//     })
//     console.log(status)
//
//     // https://oauth.vk.com/authorize?client_id=6982830&display=page&scope=manage,messages,photos,docs&response_type=token&v=5.103&state=123456&group_ids=122178863,147858640
//     // 122178863 = 4bf0a729c538cbbd7e11e7147c582b107a0435449f386c2953a176b43ba34af7d055bfe847275855b51ea
//     // 147858640 = ecb274225fb3b2ffb728e697aa0ef6aaee7ae89e57146801a86c1190a62f70e27670ae9972133a4b193c6
//
// }, null, true, 'Europe/Moscow')
