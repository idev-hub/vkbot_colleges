import {bot} from '../Bot'

class Command {
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