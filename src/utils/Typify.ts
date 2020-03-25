export default class Typify {
    private readonly json: object;
    private readonly toJson: object;
    private readonly array: Array<object>;

    /**
     * Конструктор который принимает в себя два Json объекта для работы с внутреними функциями
     *
     * @param _json - То что нужно перевести
     * @param _toJson - Во что нужно перевести
     **/
    constructor(_json: object, _toJson: object) {
        this.json = _json;
        this.toJson = _toJson;
        this.array = []
    }

    /**
     * Перебирает массив с данными и выполняет преоброзование из одного json объекта в другой
     * @returns Возвращяет новый массив преобразовынных объектов
     **/
    public typifyJson = (): Array<object> => { // Начало перевода

        if (this.json) { // Проверка на существование
            if (Array.isArray(this.json)) { // Проверка если передан массив
                for (let obj of this.json) {
                    this.array.push(this.toLine(obj, this.toJson))
                }
            } else { // Если не передан массив
                this.array.push(this.toLine(this.json, this.toJson))
            }
        }

        return this.array
    }

    /**
     * Совершает преоброзование одного объекта в другой
     * @param obj1 - То что нужно перевести
     * @param obj2 - Во что нужно перевести
     * @returns Возвращяет преобразованный объект
     **/
    public toLine = (obj1: object, obj2: object): object => { // Перевод одного объекта в другой объект
        let data: object = {}
        Object.keys(obj1).map(function (key, index) {
            Object.keys(obj2).map(function (toKey) {
                if (index == obj2[toKey]) data[toKey] = obj1[key]
            })
        })
        return data
    }
}
