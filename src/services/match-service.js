import { Board, MAX_POCKETS, STORE_A, STORE_B, BASE_SIZE } from '../models/board'
import { Match } from '../models/match'

import { BoardService } from '../services/board-service'

import SIDES from '../shared/sides'
import MOVES from '../shared/moves'

import { Check } from '../decorators/check'
import { Injectable, Inject } from '../decorators/injector'

import { hasValueOf } from '../util/minidash'
import delay from '../util/delay';

@Injectable()
export class MatchService {

    @Inject(BoardService)
    boardService: BoardService

    start(match: Match, side?: Symbol) {
        if (side && hasValueOf(SIDES, side))
            match.turn = side

        this.boardService.reset(match.board)
    }

    async move(match: Match, side: Symbol, pocketId: number) {
        if (!hasValueOf(SIDES, side))
            throw new Error('illegal side')
        
        if (match.turn !== side)
            return MOVES.WAITING
        
        const transferedId = this.boardService.transfer(match.board, pocketId)

        if (transferedId === -1)
            return MOVES.ILLEGAL

        const sameLane = this.boardService.sameLane(pocketId, transferedId)

        // check if the last pebble landed in the same lane as the current players' lane
        let withinLane = false
        if (!sameLane || (withinLane = (sameLane && !this.boardService.isStorePocket(transferedId)))) {
            this.toggleTurn(match)

            // check opposite side for transferable pebbles
            if (withinLane) {
                const pocket = this.boardService.fetch(match.board, transferedId)
                if (pocket.score === 1) {
                    const opposite = this.boardService.fetch(match.board, this.boardService.oppositePockedId(transferedId))

                    // take all pebbles from the last pocket and the opposite pocket
                    if (opposite.score > 0) {
                        const store = this.boardService.getStoreByLane(match.board, side)
    
                        // giving more visual feedback when 'stealing' opposite pebbles
                        await delay(1000)

                        this.boardService.transferAll(match.board, transferedId, store.index)
                        this.boardService.transferAll(match.board, opposite.index, store.index)
                    }
                }
            }
        }

        const isLaneAEmpty = this.isLaneEmpty(match, SIDES.OPPONENT)
        const isLaneBEmpty = this.isLaneEmpty(match, SIDES.PLAYER)

        if (isLaneAEmpty || isLaneBEmpty) {
            // giving more visual feedback when taking remaining pebbles
            await delay(1000)

            if (isLaneAEmpty && !isLaneBEmpty)
                this.#transferLaneToVictor(match, SIDES.PLAYER)
            else if (isLaneBEmpty && !isLaneAEmpty)
                this.#transferLaneToVictor(match, SIDES.OPPONENT)
        }

        return MOVES.SUCCESS
    }

    toggleTurn(match: Match) {
        match.turn = match.turn === SIDES.PLAYER ? SIDES.OPPONENT : SIDES.PLAYER
    }

    isLaneEmpty(match: Match, side: Symbol) {
        const pockets = this.boardService.getPocketsByLane(match.board, side)

        return pockets.filter(x => x.score > 0).length === 0 
    }

    isBoardCleared(match: Match) {
        return this.isLaneEmpty(match, SIDES.OPPONENT) || this.isLaneEmpty(match, SIDES.PLAYER)
    }

    getVictor(match: Match): Symbol {
        if (!this.isBoardCleared(match))
            return null

        return match.board.storeB.score > match.board.storeA.score ? SIDES.PLAYER : SIDES.OPPONENT
    }

    #transferLaneToVictor(match: Match, side: Symbol) {
        const store = this.boardService.getStoreByLane(match.board, side)
        // get opposite lane
        const pockets = this.boardService.getPocketsByLane(match.board, side)

        for (let i = 0; i < pockets.length; i++) 
            this.boardService.transferAll(match.board, pockets[i].index, store.index)
    }
}