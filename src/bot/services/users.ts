import axios from 'axios'
import configs from "../../configs";

/**
 * Проверяет существование пользователя в текущей сессий, если не находит запрашивает информацию о нем в юазе данных
 * @param _ctx - Контекст главного Бота содержащий в себе информацию о сессий и peer_id пользователя
 * @returns В случае успешного поиска возвращяет этого пользователя, если пользователь не существует вернет null
 * @beta
 **/
export const isLogin = async (_ctx: any) => {

    try {
        if (_ctx.session.user) {

            return _ctx.session.user

        } else {

            const user = await getUser({peerId: _ctx.senderId})
            return user ? user : null

        }
    } catch (error) {

        return {error}

    }

}

/**
 * Отправляет запрос в базу данных для добавления нового пользователя в базу данных
 * @param _body - Тело запрос. Передаваемая информация о новом пользователе
 * @returns В случае успешного запроса вернет созданного пользователя
 * @beta
 **/
export const addUser = async (_body: object) => {
    try {
        const res = await axios.post(`${configs.database.uri}/api/user`, _body)
        return res.data
    } catch (error) {
        return {error}
    }
}

/**
 * Отправляет запрос в базу данных для поиска пользователя в базе данных
 * @param _params - Параметры запроса.
 * @returns В случае успешного запроса вернет массив с пользователями подходящих под параметры запроса
 * @beta
 **/
export const getUser = async (_params: object = {}) => {

    try {
        const res = await axios.get(`${configs.database.uri}/api/user`, {
            params: _params
        })
        return res.data.json[0]
    } catch (error) {
        return {error}
    }
}