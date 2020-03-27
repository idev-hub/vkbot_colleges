import {IKeyboardProxyButton, Keyboard} from "vk-io";

export interface IKeyboardItem {
    text: string
    command: string
}

/**
 * Генерирует клавиатуру из массива по ширине и высоте
 **/
export function GenerateKeyboards(items: Array<IKeyboardItem> = [], rows: number = 4, columns: number = 5,  coefficientColor: number = 3): Array<Array<IKeyboardProxyButton>> {
    let keyboards = [], index = items.length

    for (let r = 0; r < rows; r++) {
        let col = []

        for (let c = 0; c < columns; c++) {
            index--
            if (index >= 0) {
                col.push(
                    Keyboard.textButton({
                        label: items[index]["text"],
                        payload: {command: items[index]['command']},
                        color: index%coefficientColor?Keyboard.POSITIVE_COLOR:Keyboard.NEGATIVE_COLOR
                    })
                )
            }
        }

        keyboards.push(col)
    }

    return keyboards
}