import { DateTime } from 'luxon';

export default class Luxon {

    /**
     * Переменная с текущей датой
     **/
    public local: any;

    /**
     * Расширение функционала времени
     * @param zone {string} - Строка со временой зоной
     * @param date {DateTime} - Дата и время
     **/
    constructor(zone:string = "Asia/Yekaterinburg", date: DateTime = DateTime.local()) {
        this.local = date
        if(zone) this.local.setZone(zone)
    }

    /**
     * Возвращяет преобразованное в ISO формат время
     * @returns {string} Строка содержащяя время в ISO формате
     **/
    public getISO = (): string => this.local.toISO()

    /**
     * Добавляет указанное количество часов к текущему времени
     * @param _hours {number} Колличество часов
     * @returns {Luxon} Luxon
     **/
    public add(_hours: number): Luxon {
        this.local = this.local.plus({hours: _hours})
        return this
    }

    /**
     * Убавляет указанное количество часов у текущего времени
     * @param _hours {number} Колличество часов
     * @returns {Luxon} Luxon
     **/
    public subtract(_hours: number): Luxon {
        this.local = this.local.minus({hours: _hours})
        return this
    }

    /**
     * Проверяет какой день недели в указаную дату
     * @returns {number} Номер дня недели от 1 до 7
     **/
    public week = ():number => this.local.weekday

    /**
     * Форматирует дату к указаному шаблону
     * @param format {string} Строка формата времени
     * @returns {string} Отформатированная в строку дата
     **/
    public pin = (format: string = 'dd.LL.yyyy'): string => this.local.toFormat(format)
}