import { Board, MAX_POCKETS, STORE_A, STORE_B, BASE_SIZE } from '../models/board'

import SIDES from '../shared/sides'

import { Check } from '../decorators/check'
import { Injectable } from '../decorators/injector'

import { hasValueOf } from '../util/minidash'
import bimap from '../util/bimap'

const validLane = (side: Symbol) => hasValueOf(SIDES, side)
const validPocket = (id: number) => id >= 0 && id < MAX_POCKETS
const isStorePocket = (id: number) => [STORE_A, STORE_B].indexOf(id) !== -1

const nums = (Array.from(Array(MAX_POCKETS / 2 - 1), (v, k) => k))
const mapping = bimap(nums.reduce((prev, v) => {
    return { ...prev, [v]: (MAX_POCKETS - 1) - (v + 1) }
}, {}))

@Injectable()
export class BoardService {

    reset(board: Board) {
        for (let i = 0; i < board.pockets.length; i++)
            board.pockets[i].score = board.pockets[i].initialScore
        for (let i = 0; i < board.pebbles.length; i++)
            board.pebbles[i].host = this.fetch(board, board.pebbles[i].initialHostId)
    }

    isStorePocket(id: number) {
        return isStorePocket(id)
    }

    @Check((board: Board, id: number) => validPocket(id))
    getPebblesByPocket(board: Board, id: number) {
        return board.pebbles.filter(x => x.host.index === id)
    }

    @Check((board: Board, side: Symbol) => validLane(side))
    getPocketsByLane(board: Board, side: Symbol) {
        const flag = side === SIDES.OPPONENT ? false : true
        return board.pockets.filter(x => flag ? x.index > STORE_A && x.index < STORE_B : x.index < STORE_A)
    }

    @Check((id: number) => validPocket(id))
    getLaneByPocket(id: number) {
        return id <= STORE_A ? SIDES.OPPONENT : SIDES.PLAYER
    }

    @Check((board: Board, side: Symbol) => validLane(side))
    getStoreByLane(board: Board, side: Symbol) {
        return this.fetch(board, side === SIDES.OPPONENT ? STORE_A : STORE_B)
    }

    // @Check((board: Board, id: number) => validPocket(id) && !isStorePocket(id))
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

    @Check((board: Board, from: number, to: number) => validPocket(from) && validPocket(to))
    transferAll(board: Board, from: number, to: number) {
        const pebbles = this.getPebblesByPocket(board, from)

        const a = this.fetch(board, from)
        const b = this.fetch(board, to)

        for (let i = 0; i < pebbles.length; i++)
            pebbles[i].host = b

        b.score += a.score
        a.score = 0
    }

    @Check((from: number) => validPocket(from) && !isStorePocket(from))
    oppositePockedId(from: number) {
        const side = this.getLaneByPocket(from)
        if (side === SIDES.PLAYER)
            return +mapping.inverse[from]
        
        return +mapping.map[from]
    }

    @Check((from: number) => validPocket(from))
    _wrapPocketId(from: number, to: number) {
        return (from + to) % MAX_POCKETS
    }
}