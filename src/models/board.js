import { Pocket } from './pocket'

export const MAX_POCKETS = 14

export const STORE_A = MAX_POCKETS / 2 - 1
export const STORE_B = MAX_POCKETS - 1

export const BASE_SIZE = 4

export class Board {
    pockets: Pocket[]
    constructor() {
        this.pockets = []

        for (let i = 0; i < MAX_POCKETS; i++)
            this.pockets.push(new Pocket(i, 0))
    }

    get storeA(): Pocket {
        return this.pockets[STORE_A]
    }

    get storeB(): Pocket {
        return this.pockets[STORE_B]
    }
}