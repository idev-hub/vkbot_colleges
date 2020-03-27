import {Dialog} from "../../database/entities/Dialog";
import {randomInt} from "../../../utils/Random";
import {getCustomRepository, Not} from "typeorm";
import {User} from "../../database/entities/User";
import {DialogRepository} from "../../database/repositories/DialogRepository";


export const getFoundInterlocutor = async (user: User): Promise<Dialog> => {

    const dialogRepository = await getCustomRepository(DialogRepository)

    const dialogs = await dialogRepository.search({
        search: 'search',
        user: Not(user.id)
    })

    if(dialogs.length > 0){
        const rand = randomInt(0, dialogs.length)
        console.log(rand)
        return dialogs[rand]
    }

    return null
}
