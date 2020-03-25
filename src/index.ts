import {bot} from "./bot/Bot"
import {server} from "./server/Server";
import {database} from "./database/Database";

const appStart = async () => { // Функция по поочередному запуску проекта
    try {
        await database.connect() // Запускаем базу данных
        await server.run() // Запускаем сервер
        await bot.run() // Запускаем бота
    } catch (err) {
        console.error(err)
    }
}

// Стартуем
appStart().then(() => console.info("Application running"))