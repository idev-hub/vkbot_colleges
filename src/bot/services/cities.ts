import axios from "axios";
import configs from "../../configs";

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


export const addCity = async (_body: object) => {
    try {
        const res = await axios.post(`${configs.database.uri}/api/city`, _body)
        return res.data
    } catch (err) {
        return err
    }
}