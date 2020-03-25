import axios from 'axios'
import configs from "../../configs";

export const getCollege = async (_params: object = {}) => {
    try {
        const res = await axios.get(`${configs.database.uri}/api/college`, {
            params: _params
        })
        return res.data
    } catch (err) {
        return err
    }
}

export const getTimetable = async (_params: object = {}) => {
    try {
        const res = await axios.get(`${configs.database.uri}/api/timetable`, {
            params: _params
        })
        if(res.data) return toMessageTimetable(res.data)

        return "- Я не смог найти расписание на этот день."
    } catch (err) {
        return err
    }
}

export const toMessageTimetable = (_object: any) => {
    const tp = (_obj): string => {
        let msg = ""
        for (let key in _obj){
            if(key === "number") msg += "Номер занятия: " + _obj["number"] + "\n"
            if(key === "teacher") msg += "Преподователь: " + _obj["teacher"] + "\n"
            if(key === "location") msg += "Местоположение: " + _obj["location"]+ "\n"
            if(key === "discipline") msg += "Дисциплина: " + _obj["discipline"] + "\n"
        }
        return msg || null
    }

    if (Array.isArray(_object)) {
        let msgs = ""
        for (let obj of _object){
            msgs += tp(obj) + '\n\n'
        }
        return msgs
    } else {
        return tp(_object)
    }
}