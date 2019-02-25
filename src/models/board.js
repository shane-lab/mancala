import { Pocket } from './pocket'
import { Pebble } from './pebble'

export const MAX_POCKETS = 14

export const STORE_A = MAX_POCKETS / 2 - 1
export const STORE_B = MAX_POCKETS - 1

export const BASE_SIZE = 1

export class Board {
    pockets: Pocket[]
    pebbles: Pebble[]
    constructor() {
        this.pockets = []
        this.pebbles = []

        for (let i = 0; i < MAX_POCKETS; i++) {
            const isStore = i === STORE_A || i === STORE_B
            const pocket = new Pocket(i, isStore ? 0 : BASE_SIZE)
            if (!isStore) 
                for (let j = 0; j < BASE_SIZE; j++) 
                    this.pebbles.push(new Pebble(pocket))
            this.pockets.push(pocket)
        }
    }

    get storeA(): Pocket {
        return this.pockets[STORE_A]
    }

    get storeB(): Pocket {
        return this.pockets[STORE_B]
    }
}