import axios from "axios";
import configs from "../../configs";

/**
 * Отправляет запрос по внутренему серверу для получения списка городов
 * @param _params - Принимает json с условиями выборки
 * @returns Возвращяет массив с городами
 **/
export const getCity = async (_params: object = {}) => {
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
 * @param _body - Принимает json с телом запроса
 * @returns В случае успеха возвращяет созданный город
 **/
export const addCity = async (_body: object) => {
    try {
        const res = await axios.post(`${configs.database.uri}/api/city`, _body)
        return res.data
    } catch (err) {
        return err
    }
}