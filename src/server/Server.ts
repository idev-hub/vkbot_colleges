import * as restify from 'restify'
import configs from '../configs'

export class Server {
    public restify: any
    constructor() {
        this.restify = restify.createServer()

    }

    public run = async () => {

        this.restify.use(restify['plugins'].queryParser());
        this.restify.use(restify['plugins'].bodyParser());

        try {
            import('./routes/cities')
            import('./routes/colleges')
            import('./routes/users')

            await this.restify.listen(configs.server.port)
            configs.database.uri = this.restify.url

            return true
        } catch (err) {
            return err
        }
    }
}

export const server = new Server()
