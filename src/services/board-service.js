import { Board, MAX_POCKETS, STORE_A, STORE_B, BASE_SIZE } from '../models/board'

import { Check } from '../decorators/check'
import { Injectable } from '../decorators/injector'

const validPocket = (id: number) => id >= 0 && id < MAX_POCKETS
const isStorePocket = (id: number) => [STORE_A, STORE_B].indexOf(id) !== -1

@Injectable()
export class BoardService {

    @Check((board: Board, id: number) => validPocket(id))
    getPebblesByPocket(board: Board, id: number) {
        return board.pebbles.filter(x => x.host.index === id)
    }

    @Check((board: Board, id: number) => validPocket(id) && !isStorePocket(id))
    fetch(board: Board, id: number) {
        return board.pockets[id]
    }

    /**
     * checks if two pocket ids belong to the same lane 
     */
    @Check((a: number, b: number) => validPocket(a) && validPocket(b))
    sameLane(a: number, b: number) {
        return (a <= STORE_A && b <= STORE_A) || (a > STORE_A && b > STORE_A)
    }

    /**
     * transfers all the score of the determined pocket to the ones next in line (counter clock wise)
     * @return {number} Returns the id of the last transfered pocket or 0
     */
    @Check((board: Board, from: number) => validPocket(from) && !isStorePocket(from))
    transfer(board: Board, from: number) {
        const pocketIds = [];

        const pocket = this.fetch(board, from)

        const { score } = pocket

        const pebbles = this.getPebblesByPocket(board, from)
        
        pocket.score = 0

        let j = 0;
        const wrap = (): number => {
            const next = this._wrapPocketId(from, ++j)
            const sameLane = this.sameLane(from, next)
            if (!sameLane && isStorePocket(next))
                return wrap()

            return next
        }

        let lastId = -1
        for (let i = 0; i < score; i++) {
            const pocket = board.pockets[lastId = wrap(from)]
            pocket.score++
            pebbles[i].host = pocket
        }

        return lastId
    }

    @Check((from: number) => validPocket(from))
    oppositePockedId(from: number) {
        return this._wrapPocketId(from, MAX_POCKETS / 2)
    }

    @Check((from: number) => validPocket(from))
    _wrapPocketId(from: number, to: number) {
        return (from + to) % MAX_POCKETS
    }
}