import Storage from "./core/orm/Storage"
import {server} from "./server/Server";
import {bot} from "./bot/Bot";

/**
 * Функция по поочередному запуску проекта
 **/
const appStart = async () => {
    await new Storage().connect() // Запускаем базу данных
    await server.run() // Запускаем сервер
    await bot.run() // Запускаем бота
}
appStart().then(() => console.info("Application running")).catch(console.error)