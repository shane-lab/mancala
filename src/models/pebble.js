import { Pocket } from './pocket';

export class Pebble {
    constructor(host: Pocket) {
        this.initialHostId = host.index
        this.host = host
        Object.freeze(this.initialHost)
    }
}