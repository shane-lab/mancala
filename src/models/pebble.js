import { Pocket } from './pocket'

export class Pebble {
    host: Pocket
    constructor(host: Pocket) {
        this.initialHostId = host.index
        this.host = null //host
        Object.freeze(this.initialHost)
    }
}