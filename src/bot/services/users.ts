import axios from 'axios'
import configs from "../../configs";
import {User} from "../../core/orm/models/User";
import {Context} from "vk-io";

/**
 * Проверяет существование пользователя в текущей сессий, если не находит запрашивает информацию о нем в юазе данных
 * @param _ctx {Context} Context
 * @returns {Promise<User>} Пользователь
 **/
export const isLogin = async (_ctx: Context): Promise<User> => {

    if (_ctx.session.user) return _ctx.session.user

    const user = await getUser({peerId: _ctx.senderId})
    return user ? user : null

}

/**
 * Отправляет запрос в базу данных для добавления нового пользователя в базу данных
 * @param _body {object} - Данные пользователя
 * @returns {Promise<User>} Созданный пользователь
 **/
export const addUser = async (_body: object): Promise<User> => {
    const res = await axios.post(`${configs.database.uri}/api/user`, _body)
    return res.data
}

/**
 * Отправляет запрос в базу данных для поиска пользователя в базе данных
 * @param _params {object} Параметры запроса
 * @returns {Promise<User>} Пользователь
 * @beta
 **/
export const getUser = async (_params: object = {}): Promise<User> => {
    const res = await axios.get(`${configs.database.uri}/api/user`, {
        params: _params
    })
    return res.data.json[0]
}