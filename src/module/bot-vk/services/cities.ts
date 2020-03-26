import axios from "axios";
import configs from "../../../configs";
import {City} from "../../../core/orm/models/City";

/**
 * Отправляет запрос по внутренему серверу для получения списка городов
 * @param _params {object} Условия выборки
 * @returns {Promise<Array<City>>} Массив с городами
 **/
export const getCity = async (_params: object = {}): Promise<Array<City>> => {
    try {
        const res = await axios.get(`${configs.database.uri}/api/city`, {
            params: _params
        })
        return res.data
    } catch (err) {
        return err
    }
}

/**
 * Отправляет запрос по внутренему серверу для создания нового города
 * @param _body {object} Взодные данные
 * @returns {Promise<City>} Созданный город
 **/
export const addCity = async (_body: object): Promise<City> => {
    try {
        const res = await axios.post(`${configs.database.uri}/api/city`, _body)
        return res.data
    } catch (err) {
        return err
    }
}