import * as Parser from 'rss-parser'

/**
 * Парсинг RSS контента
 **/
export default class RSSParser {

    private parser: Parser
    public url: string


    constructor(_url: string){
        this.parser = new Parser()
        this.url = _url
    }

    /**
     * Получение спарсенных данных
     * @returns {Promise<object>}
     **/
    public getData = async () => await this.parser.parseURL(this.url)

}