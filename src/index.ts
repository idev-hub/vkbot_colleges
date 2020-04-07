import {studyBot} from "./module/bot-vk";
import {storage} from "./module/database";

/**
 * Функция по поочередному запуску проекта
 **/
const appStart = async () => {
    await storage.connect() // Запускаем базу данных
    await studyBot.updates.start() // Запускаем бота
}

appStart().then(() => console.info("Application running")).catch((error) => console.error({error}))