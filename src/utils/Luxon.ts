import { DateTime } from 'luxon';


export default class Luxon {

    /**
     * @public
     * Переменная с текущей датой
     **/
    public local: any;

    /**
     * Расширение функционала времени
     * @param zone - строка содержащая временную зону
     * @param date - устанавливаемая дата
     **/
    constructor(zone:string = "Asia/Yekaterinburg", date: Date = new Date()) {
        this.local = DateTime.local().setZone(zone)
    }

    /**
     * @public
     * Добавляет указанное количество часов к текущему времени
     * @param _hours - число, колличество часов
     * @returns Возвращяет Luxon
     **/
    public add(_hours: number): Luxon {
        this.local = this.local.plus({hours: _hours})
        return this
    }

    /**
     * @public
     * Убавляет указанное количество часов у текущего времени
     * @param _hours - число, колличество часов
     * @returns Возвращяет Luxon
     **/
    public subtract(_hours: number): Luxon {
        this.local = this.local.minus({hours: _hours})
        return this
    }

    /**
     * @public
     * Проверяет какой день недели в указаную дату
     * @returns Возвращяет номер дня недели от 1 до 7
     **/
    public week = ():number => this.local.weekday

    /**
     * @public
     * Форматирует дату к указаному шаблону
     * @param format - строка, формат времени
     * @returns Возвращает отформатированную дату
     **/
    public pin = (format: string = 'dd.LL.yyyy'): string => this.local.toFormat(format)
}