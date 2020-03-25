import axios from 'axios'
import configs from "../../configs";

export const isLogin = async (_ctx: any) => {

    try {

        if(_ctx.session.user) {

            return _ctx.session.user

        } else {

            const user = await getUser({peerId: _ctx.senderId})
            return user[0] ? user[0] : null

        }
    } catch (err) {

        return err

    }


}

export const addUser = async (_body: object) => {
    try {
        const res = await axios.post(`${configs.database.uri}/api/user`, _body)
        return res.data
    } catch (err) {
        console.error(err)
        return err
    }
}

export const getUser = async (_params: object = {}) => {
    try {
        const res = await axios.get(`${configs.database.uri}/api/user`, {
            params: _params
        })
        return res.data
    } catch (err) {
        console.error(err)
        return err
    }
}