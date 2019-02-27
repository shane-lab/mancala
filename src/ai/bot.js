import clone from 'clone-deep'

import { Inject } from '../decorators/injector'

import { Board, STORE_A, STORE_B } from '../models/board'
import { Match } from '../models/match'

import { BoardService } from '../services/board-service'
import { MatchService } from '../services/match-service'

import MOVES from '../shared/moves'
import SIDES from '../shared/sides'

import { hasValueOf } from '../util/minidash'

class BoardCopy {
    constructor(board: Board) {
        const newBoard = new Board

        this.pebbles = []

        this.pockets = newBoard.pockets.map((x, i) => {
            x.score = board.pockets[i].score
            return x
        })
    }

    get storeA() {
        return this.pockets[STORE_A]
    }

    get storeB() {
        return this.pockets[STORE_B]
    }
}

class MatchCopy {
    board: Board
    constructor(match: Match, side?: Symbol) {
        this.turn = side && hasValueOf(SIDES, side) ? side : match.turn // clone(match.turn)
        this.board = new BoardCopy(match.board)
    }
}

// TODO move to service worker to split the load and create unblocking ui
export class Bot {
    #side: Symbol
    #maxDepth: number
    #min: number
    #max: number

    @Inject(BoardService)
    boardService: BoardService

    @Inject(MatchService)
    matchService: MatchService

    constructor(side: Symbol, depth: number, alpha: number, beta: number) {
        this.side = side
        this.maxDepth = depth
        this.min = alpha
        this.max = beta
    }

    get side() {
        return this.#side
    }

    /// get all indices of the pockets of the given side that contain any pebbles
    legalMoves(match: Match, side: Symbol) {
        return this.boardService.getPocketsByLane(match.board, side)
            .filter(x => x.score > 0)
            .map(x => x.index)
    }

    /**
     * finds the best suitable move to perform 
     * @param {Match} match 
     * @return {Number} the move to select, -1 when no move is possible
     */
    async move(match: Match) {
        const [score, move] = await this.#maxMove(new MatchCopy(match), this.#side, this.#maxDepth, this.#min, this.#max)

        return move
    }

    async #maxMove(match: Match, side: Symbol, depth: number, alpha: number, beta: number) {
        let bestScore = this.#min
        let bestMove = -1

        const moves = this.legalMoves(match, side)

        if (depth === 0 || this.matchService.getVictor(match)) 
            return [this.#matchScore(match, side), -1]

        for (const move of moves) {
            const copy = new MatchCopy(match)
            await this.matchService.move(copy, copy.turn, move, false)

            let res: number[]
            // if the move yields a new turn, check another max move
            if (copy.turn === side)
                res = await this.#maxMove(copy, copy.turn, depth - 1, alpha, beta)
            else 
                res = await this.#minMove(copy, copy.turn, depth - 1, alpha, beta)

            const [score, next] = res

            if (score > bestScore) {
                bestScore = score
                bestMove = move
            }

            if (score >= beta)
                break
            if (score > alpha)
                alpha = score
        }

        return [bestScore, bestMove]
    }

    async #minMove(match: Match, side: Symbol, depth: number, alpha: number, beta: number) {
        let bestScore = this.#max
        let bestMove = -1

        const moves = this.legalMoves(match, side)

        if (depth === 0 || this.matchService.getVictor(match))
            return [this.#matchScore(match, side), -1]

        for (const move of moves) {
            const copy = new MatchCopy(match)
            await this.matchService.move(copy, copy.turn, move, false)

            let res: number[]
            // if the move yields a new turn, check another max move
            if (copy.turn === side)
                res = await this.#minMove(copy, copy.turn, depth - 1, alpha, beta)
            else
                res = await this.#maxMove(copy, copy.turn, depth - 1, alpha, beta)

            const [score, next] = res

            if (score < bestScore) {
                bestScore = score
                bestMove = move
            }

            if (score <= alpha)
                break
            if (score < beta)
                beta = score
        }

        return [bestScore, bestMove]
    }

    #matchScore(match: Match, side: Symbol) {
        let victor
        if (victor = this.matchService.getVictor(match))
            return victor === side ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY

        const { storeA, storeB } = match.board

        return side === SIDES.PLAYER ? (storeB.score - storeA.score) : (storeA.score : storeB.score)
    }
}