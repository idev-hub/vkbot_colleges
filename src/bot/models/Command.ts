import {bot} from '../Bot'

class Command {
    /**
     * Класс обёртка для создания комманд BotVK
     * @param name - Имя комманды.
     * @param conditions - Массив со строками. Используется для создания текстовых комманд.
     * @param handle - Callback функиця. Описывает функцию при вызове комманды.
     * @beta
     **/
    constructor(name, conditions, handle) {
        if (typeof handle !== 'function') {
            handle = conditions;
            conditions = [`${name}`]
        }

        if (!Array.isArray(conditions)) {
            conditions = [conditions]
        }

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

export default Command