import { Board } from './board'

import SIDES from '../shared/sides'

import { hasValueOf } from '../util/minidash'

type PlayerTurn = typeof SIDES.OPPONENT | typeof SIDES.PLAYER

export class Match {
    #turn: PlayerTurn
    #board: Board
    constructor(board: Board, turn: PlayerTurn) {
        this.#board = board
        this.#turn = turn
    }

    get board() {
        return this.#board
    }

    get turn() {
        return this.#turn
    }

    set turn(side: Symbol) {
        if (! hasValueOf(SIDES, side))
            throw new Error('illegal side')

        this.#turn = side
    }
}