import VKBot from "./models/VKBot";
import {studyBotConfigs} from "../../configs/VKConfigs";

export const studyBot = new VKBot(studyBotConfigs)

import ('./scenes')
import ('./commands')
import {cron} from './services/cron'
cron.start()