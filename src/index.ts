import {bot} from "./module/bot-vk";
import {storage} from "./module/database";
import {server} from "./module/server";

/**
 * Функция по поочередному запуску проекта
 **/
const appStart = async () => {
    await storage.connect() // Запускаем базу данных
    await server.run() // Запускаем сервер
    await bot.run() // Запускаем бота
}

appStart().then(() => console.info("Application running")).catch(console.error)