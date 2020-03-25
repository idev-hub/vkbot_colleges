import * as moment from 'moment'
import ('moment-timezone')

export default class Moment {
    public now: any;

    constructor(tz = "Asia/Yekaterinburg") {
        this.now = moment().tz(tz)
    }

    public add(hours: number) {
        this.now = this.now.add(hours, "hours")
        return this
    }

    public subtract(hours: number) {
        this.now = this.now.subtract(hours, "hours")
        return this
    }

    public week() {
        return (this.now.format('dddd') == 'Monday') ? "Понедельник" : (this.now.format('dddd') == 'Tuesday') ? "Вторник" : (this.now.format('dddd') == 'Wednesday') ? "Cреда" : (this.now.format('dddd') == 'Thursday') ? "Четверг" : (this.now.format('dddd') == 'Friday') ? "Пятница" : (this.now.format('dddd') == 'Saturday') ? "Суббота" : "Воскресенье"
    }

    public pin(format: string = 'DD.MM.YYYY') {
        return this.now.format(format)
    }

}