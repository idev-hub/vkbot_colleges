import {MemoryStorage, SessionManager} from '@vk-io/session'
import {Middleware, SceneManager, StepScene, StepSceneHandler} from '@vk-io/scenes'
import VK, {MessageContext} from 'vk-io'
import {IVKOptions} from "vk-io/lib/types";
import {getCustomRepository} from "typeorm";
import {UserRepository} from "../../database/repositories/UserRepository";
import {studyBot} from "../index";


export default class VKBot extends VK {

    public readonly sessionManager: SessionManager
    public readonly sceneManager: SceneManager

    constructor(options: Partial<IVKOptions>) {
        super(options);

        this.sessionManager = new SessionManager()
        this.sceneManager = new SceneManager()

        this.updates.on('message', (ctx, next) => ctx.isOutbox ? undefined : next())
        this.updates.on('message', this.sessionManager.middleware)
        this.updates.on('message', this.sceneManager.middleware)
        this.updates.on('message', this.sceneManager.middlewareIntercept)

        // Добавляем в context сообщений новые данные о командах кнопок
        this.updates.on('message', (ctx, next) => {
            const {messagePayload} = ctx
            ctx.state.command = messagePayload && messagePayload.command
                ? messagePayload.command
                : null

            return next()
        })

        // Проверка авторизации пользователя
        this.updates.on('message', async (ctx, next) => {
            try {

                ctx.getUser = async () => {
                    let user = await this.api.users.get({
                        user_ids: [`${ctx.peerId}`],
                        fields: ["sex", "city", "bdate"],
                        name_case: "nom"
                    })
                    return user.length > 0 ? user[0] : undefined
                }

                if (!ctx.session.user) {

                    const userRepository = await getCustomRepository(UserRepository)
                    const user = await userRepository.find({peerId: ctx.peerId})

                    if (user != null) {
                        ctx.session.user = user

                        return next()
                    }
                } else {
                    return next()
                }

                // Если пользователь не авторизован, перекидываем его на авторизацию
                await ctx.send("&#129302; - Привет!\n" +
                    "Меня создали для упрощения твоего бытия в учебном учреждении. Моя основная задача - это присылать тебе расписание занятий на выбраный тобою день. \n\n" +
                    "Тут всё просто, сперва нужно ответить на несколько вопросов, не бойся. Это быстро!")
                return ctx.scene.enter('register-scene')

            } catch (error) {

                console.error({error})
                return ctx.reply('Упс... Ошибка \n\n' + error)

            }
        })

    }

    public scene = (name: string, raws: Array<StepSceneHandler<MessageContext>>) => {
        this.sceneManager.addScene(new StepScene(name, raws))
    }

    public command = (name: string, conditions: Array<string | RegExp>, handler: Middleware<MessageContext>) => {
        this.updates.hear([
            (text, {state}) => (
                state.command === name
            ),
            ...conditions
        ], handler)
    }

}