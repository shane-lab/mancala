import { Injectable } from '../decorators/injector'

import { enumerator } from '../util/enum'

export const LEVELS = {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    LOG: 4
}

@Injectable()
export class LoggerService {
    named?: string
    level: number
    constructor(level: number, name?: string) {
        this.level = level || LEVELS.INFO
        this.named = name
    }


}