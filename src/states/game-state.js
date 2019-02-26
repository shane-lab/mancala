import { BaseState } from './base-state'
import { IdleState } from './idle-state'

import { BoardService } from '../services/board-service'
import { MatchService } from '../services/match-service'

import { Board } from '../models/board'
import { Match } from '../models/match'

import STATES from '../shared/states'
import MODES from '../shared/modes'
import MOVES from '../shared/moves'

import { Inject } from '../decorators/injector'

import { hasValueOf } from '../util/minidash'
import SIDES from '../shared/sides';

export class GameState extends BaseState {
    #board: Board
    #mode: Symbol
    #match: Match
    #subscription: Subscription
    #moving = false

    @Inject(BoardService)
    boardService: BoardService

    @Inject(MatchService)
    matchService: MatchService

    constructor(board: Board, mode: Symbol, subscriber, publisher) {
        super(subscriber, publisher)

        if (!hasValueOf(MODES, mode))
            throw new Error('the given mode is not a valid play mode')
        
        this.#board = board
        this.#mode = mode
        this.#match = new Match(this.#board, SIDES.PLAYER)
    }

    async onEnter(transitionTo) {
        console.log(`playing game in mode ${this.#mode.description}`)

        this.matchService.start(this.#match, SIDES.PLAYER)
        
        this.publisher(STATES.SWITCH_TURN, this.#match.turn)

        this.#subscription = this.subscriber(STATES.POCKET_SELECT, async (pocketId: number) => {
            if (this.#moving)
                return
            
            this.#moving = true

            const side = this.boardService.getLaneByPocket(pocketId)

            let move = MOVES.ILLEGAL
            try {
                move = await this.matchService.move(this.#match, side, pocketId)
            } catch(e) { }

            let victor
            if (victor = this.matchService.getVictor(this.#match)) {

                transitionTo(
                    IdleState,
                    this.#match.board,
                    this.subscriber,
                    this.publisher
                )

                this.publisher(STATES.VICTOR, victor)
            }
            else {
                if (this.#match.turn !== side) 
                    this.publisher(STATES.SWITCH_TURN, this.#match.turn)
            }

            this.#moving = false
        })
    }
    
    async onExit() {
        await this.#subscription.unsubscribe()
    }

    canTransitionTo(stateInterface: FunctionConstructor) {
        return stateInterface === IdleState
    }
}