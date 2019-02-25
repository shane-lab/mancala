import { Board, MAX_POCKETS, STORE_A, STORE_B, BASE_SIZE } from '../models/board'
import { Match } from '../models/match'

import { BoardService } from '../services/board-service'

import SIDES from '../shared/sides'
import MOVES from '../shared/moves'

import { Check } from '../decorators/check'
import { Injectable, Inject } from '../decorators/injector'

import { hasValueOf } from '../util/minidash'

@Injectable()
export class MatchService {

    @Inject(BoardService)
    boardService: BoardService

    start(match: Match, side?: Symbol) {
        if (side && hasValueOf(SIDES, side))
            match.turn = side

        this.boardService.reset(match.board)
    }

    move(match: Match, side: Symbol, pocketId: number) {
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
                if (pocket.score !== 1)
                    return
                
                const opposite = this.boardService.fetch(match.board, this.boardService.oppositePockedId(transferedId))
                
                // todo take x from pocket y and append to pocket z
            }
        }

        return MOVES.SUCCESS
    }

    toggleTurn(match: Match) {
        match.turn = match.turn === SIDES.PLAYER ? SIDES.OPPONENT : SIDES.PLAYER
    }
}