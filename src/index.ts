import Storage from "./core/orm/Storage"
import {server} from "./server/Server";
import {bot} from "./bot/Bot";


/**
 * Функция по поочередному запуску проекта
 **/
const appStart = async () => {
    try {
        await new Storage().connect() // Запускаем базу данных
        await server.run() // Запускаем сервер
        await bot.run() // Запускаем бота
    } catch (err) {
        console.error(err)
    }
}

// Стартуем
appStart().then(() => console.info("Application running"))