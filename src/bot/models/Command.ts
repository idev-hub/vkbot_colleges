import {bot} from '../Bot'

export default class Command {

    /**
     * Класс обёртка для создания комманд BotVK
     * @param name {string} - Имя комманды.
     * @param conditions {Array<string>>} - Массив со строками. Используется для создания текстовых комманд.
     * @param handle {any}
     * @beta
     **/
    constructor(name: string, conditions: Array<string>, handle: any) {
        bot.VK.updates.hear(
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