import VKBot from "./models/VKBot";
import configs from "../../configs";

export const bot = new VKBot(configs.bot.connect)