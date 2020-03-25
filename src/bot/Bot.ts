import {VK} from "vk-io"
import {SessionManager} from '@vk-io/session'
import {SceneManager} from '@vk-io/scenes'

import configs from "../configs"
import {isLogin} from "./services/users";

class Bot {

    public VK
    public sessionManager
    public sceneManager

    constructor() {
        this.VK = new VK({
            token: configs.vkBot.access_token
        })
        this.sessionManager = new SessionManager()
        this.sceneManager = new SceneManager()


        // Проверяем на ВХОДЯЩЕЕ сообщение, если всё хорошо переходим к следующему middleware
        this.VK.updates.on('message', (ctx, next) => ctx.isOutbox ? undefined : next())


        this.VK.updates.on('message', this.sessionManager.middleware)
        this.VK.updates.on('message', this.sceneManager.middleware)
        this.VK.updates.on('message', this.sceneManager.middlewareIntercept)

        // Добавляем в context сообщений новые данные о командах кнопок
        this.VK.updates.on('message', (ctx, next) => {

            const {messagePayload} = ctx
            ctx.state.command = messagePayload && messagePayload.command
                ? messagePayload.command
                : null

            return next()
        })

        // Проверка авторизации пользователя
        this.VK.updates.on('message', async (ctx, next) => {
            try {
                const user = await isLogin(ctx)

                if (user != null) {
                    ctx.session.user = user
                    return next()
                }

                // Если пользователь не авторизован, перекидываем его на авторизацию
                await ctx.send("&#129302; - Привет!\n" +
                    "Меня создали для упрощения твоего бытия в учебном учреждении. Моя основная задача - это присылать тебе расписание занятий на выбраный тобою день. \n\n" +
                    "Тут всё просто, сперва нужно ответить на несколько вопросов, не бойся. Это быстро!")
                return ctx.scene.enter('registerScene')
            } catch (err) {
                console.error(err)
                await ctx.reply('Во время получения данных вашей авторизации произошла ошибка. \n\n' + err)
                return undefined
            }
        })
    }

    public run = async () => {

        // Импортируем все необходимые модули и конструкторы перед запуском бота
        import('./services/scenes')
        import('./services/commands')

        try {
            await this.VK.updates.startPolling() // Запускаем бота
        } catch (err) {
            return err
        }
    }
}

export const bot = new Bot();