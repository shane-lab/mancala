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

    @Inject(BoardService)
    boardService: BoardService

    @Inject(MatchService)
    matchService: MatchService

    constructor(side: Symbol, depth: number) {
        this.side = side
        this.maxDepth = depth
        // this.opponentSide = side === SIDES.PLAYER ? SIDES.OPPONENT : SIDES.PLAYER
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
        const [score, move] = await this._miniMaxMove(new MatchCopy(match), this.side, this.maxDepth)

        return move
    }

    async _miniMaxMove(match: Match, side: Symbol, depth: number) {
        const moves = this.legalMoves(match, side)
        
        let bestMove = -1
        let bestScore = Number.NEGATIVE_INFINITY

        for (const move of moves) {
            const now = performance.now()
            console.log(`checking pocket: ${move}`)
            if (depth === 0) 
                return [this._matchScore(match), move] // no depth check, return the current move
            
            let victor
            if (victor = this.matchService.getVictor(match)) 
                return [-1, -1]

            const copy = new MatchCopy(match, side)
            await this.matchService.move(copy, this.side, move, false)

            const score = await this._minScore(copy, depth - 1)
            if (score > bestScore) {
                bestMove = move
                bestScore = score
            }
            console.log(`op took: ${performance.now() - now}ms`)
        }

        return [bestScore, bestMove]
    }

    async _minScore(match: Match, depth: number, ) {
        let victor
        if (victor = this.matchService.getVictor(match))
            return this._matchScore(match, this.side)

        const moves = this.legalMoves(match, match.turn)

        let bestScore = Number.POSITIVE_INFINITY
        for (const move of moves) {
            if (depth === 0)
                return this._matchScore(match, this.side)
            
            const copy = new MatchCopy(match)
            await this.matchService.move(copy, copy.turn, move, false)

            const score = await this._maxScore(copy, depth - 1)
            if (score < bestScore)
                bestScore = score
        }

        // console.log(`min: {depth: ${depth}, best: ${bestScore}}`)

        return bestScore
    }

    async _maxScore(match: Match, depth: number) {
        let victor
        if (victor = this.matchService.getVictor(match))
            return this._matchScore(match, this.side)

        const moves = this.legalMoves(match, match.turn)

        let bestScore = Number.NEGATIVE_INFINITY
        for (const move of moves) {
            if (depth === 0)
                return this._matchScore(match, this.side)

            const copy = new MatchCopy(match)
            await this.matchService.move(copy, copy.turn, move, false)

            const score = await this._minScore(copy, depth - 1)
            if (score > bestScore)
                bestScore = score
        }

        // console.log(`max: {depth: ${depth}, best: ${bestScore}}`)

        return bestScore
    }

    _matchScore(match: Match, side: Symbol) {
        let victor
        if (victor = this.matchService.getVictor(match)) 
            return victor === side ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY

        const {storeA, storeB} = match.board

        return side === SIDES.PLAYER ? (storeB.score - storeA.score) : (storeA.score : storeB.score)
    }

    _opposingSide(side: Symbol) {
        return side === SIDES.PLAYER ? SIDES.OPPONENT : SIDES.PLAYER
    }
}