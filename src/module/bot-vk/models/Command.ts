import VKBot from "./VKBot";

export default class Command {

    /**
     * Класс обёртка для создания комманд BotVK
     * @param bot {VKBot} - Экземпляр бота
     * @param name {string} - Имя комманды
     * @param conditions {Array<string>>} - Массив со строками. Используется для создания текстовых комманд
     * @param handle {any}
     **/
    constructor(bot: VKBot, name: string, conditions: Array<string>, handle: any) {
        bot.instance.updates.hear(
            [
                (text, {state}) => (
                    state.command === name
                ),
                ...conditions
            ],
            handle
        )
    }

}