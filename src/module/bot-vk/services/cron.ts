import Luxon from "../../../utils/Luxon";
import {DateTime} from 'luxon';
import {getCustomRepository} from "typeorm";
import {UserRepository} from "../../database/repositories/UserRepository";
import {studyBot} from "../index";
import {getTimetable} from "./colleges";
import {Keyboard} from "vk-io";
import {configs} from "../../../configs/VKConfigs";
import {CityRepository} from "../../database/repositories/CityRepository";
import {CollegeRepository} from "../../database/repositories/CollegeRepository";
import RSSParser from "../../../utils/RSSParser";
import * as cron from 'node-cron'
import * as request from 'request'
import * as cheerio from 'cheerio'



export const timetable = cron.schedule('0 0 19 * * * * *', async () => {

    console.log('cron:\n Авторассылка расписания: ' + new Luxon().pin("dd.LL.yyyy HH:mm"))

    const date: Luxon = new Luxon().add(24)
    const week: number = date.week()

    if (week !== 7) {

        const userRepository = await getCustomRepository(UserRepository)
        const users = await userRepository.search({block: false, autoLink: true})

        for (const user of users) {

            try {
                const template = await getTimetable(user, date.pin())

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

}, { scheduled: true, timezone: "Europe/Moscow" })
export const updateStatus = cron.schedule('0 0 */6 * * * * *', async () => {

    console.log('cron:\n Обновление статуса: ' + new Luxon().pin("dd.LL.yyyy HH:mm"))

    const cityRepository = await getCustomRepository(CityRepository)
    const cities = await cityRepository.search()

    const collegeRepository = await getCustomRepository(CollegeRepository)
    const colleges = await collegeRepository.search()

    return  studyBot.api.status.set({
        text: `&#128204; - Бот работает в ${cities.length} городе(ах). В ${colleges.length} учебном(ых) учреждений`,
        group_id: configs.groupId,
        access_token: configs.accessToken
    })

}, { scheduled: true, timezone: "Europe/Moscow" })
export const news = cron.schedule('0 */10 * * * * *', async () => {

    console.log('cron:\n Обновление новостей: ' + new Luxon().pin("dd.LL.yyyy HH:mm"))

    const parser = new RSSParser('http://www.edu.ru/news/glavnye-novosti/feed.rss')
    const currentDate = new Luxon()
    const result = await parser.getData()
    const allPosts = await studyBot.api.wall.get({
        owner_id: -configs.groupId,
        owners_only: true,
        count: 10,
        access_token: configs.accessToken
    })
    let items = result.items.filter(value => {
        const _date = new Luxon("Europe/Moscow", DateTime.fromISO(value.isoDate))
        if (currentDate.local.hasSame(_date.local, 'day')){
            value['_date'] = _date
            return value
        }
    })
    let posts = items.filter(item => {
        for (let post of allPosts.items){
            if(post.text.search(item._date.pin('dd.LL.yyyy HH:mm')) !== -1) return item
        }
    })

    let final = items.filter(post => {
        if(posts.indexOf(post) === -1) {

            return post
        }
    })

    for (let post of final){
        await request(post.link, async (error, response, body) => {
            if(!error){
                const $ = cheerio.load(body), text = $(".news-page-text").text()
                return  studyBot.api.wall.post({
                    message: text + "\n\n" + post._date.pin('dd.LL.yyyy HH:mm') + " #актуальные #новости #образование",
                    owner_id: -configs.groupId,
                    attachments: [post.link],
                    copyright: post.link,
                    access_token: configs.accessToken
                })
            }
        })
    }

}, { scheduled: true, timezone: "Europe/Moscow" })
