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

            let {messagePayload, text} = ctx

            ctx.state.command = messagePayload && messagePayload.command
                ? messagePayload.command
                : null

            ctx.text = text.toLowerCase() // Меняем регистр всех принятых сообщений на нижний

            return next()
        })

        // Проверка авторизации пользователя
        this.updates.on('message', async (ctx, next) => {
            try {

                if(ctx.messagePayload && ctx.messagePayload.command === 'contact') return next()

                if(ctx.session.user) {
                    
                    if(ctx.session.user.block){

                        return ctx.send("&#129302; - Вам заблокировали доступ к моим возможностям.")

                    } else return next()

                } else {

                    const userRepository = await getCustomRepository(UserRepository)
                    const user = await userRepository.find({peerId: ctx.peerId})

                    if (user != null) {
                        if (user.block){
                            return ctx.send("&#129302; - Вам заблокировали доступ к моим возможностям.")
                        } else {
                            ctx.session.user = user
                            return next()
                        }
                    } else {
                        // Если пользователь не авторизован, перекидываем его на авторизацию
                        await ctx.send("&#129302; - Доброе время суток.\n" +
                            "Я бот, меня разработали для удобства и упрощения получения открытой информации по учебным учреждениям. Основная моя задача - это присылать Вам расписание занятий на запрашиваемый день. \n\n" +
                            "Пользуясь функционалом данного Проекта, Вы выражаете свое согласие с «Отказом от ответственности» и установленными Правилами и принимаете всю ответственность, которая может быть на Вас возложена.\n\n vk.com/@rasp174-polzovatelskoe-soglashenie")

                        return ctx.scene.enter('register-scene')
                    }

                }

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
            ...conditions.map(value => (typeof value === 'string')?value.toLowerCase():value)
        ], handler)
    }

}