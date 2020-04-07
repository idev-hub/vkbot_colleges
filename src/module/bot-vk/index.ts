import VKBot from "./models/VKBot";
import {studyBotConfigs} from "../../configs/VKConfigs";

export const studyBot = new VKBot(studyBotConfigs)

import ('./scenes')
import ('./commands')
import {timetable, updateStatus, news} from './services/cron'

timetable.start()
updateStatus.start()
news.start()