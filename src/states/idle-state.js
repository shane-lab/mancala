import { BaseState } from './base-state'
import { GameState } from './game-state'

import { BoardService } from '../services/board-service'

import { Board } from '../models/board'

import STATES from '../shared/states'
import MODES from '../shared/modes'

import { Inject } from '../decorators/injector'

export class IdleState extends BaseState {
    #board: Board
    #transitioning = false
    #subscription: Subscription

    @Inject(BoardService)
    boardService: BoardService

    constructor(board: Board, subscriber, publisher) {
        super(subscriber, publisher)
        this.#board = board
    }

    async onEnter(transitionTo) {
        this.#subscription = this.subscriber(STATES.PLAY, (mode: Symbol) => {
            if (this.#transitioning)
                return // disable debounce
            
            this.#transitioning = true

            transitionTo(
                GameState,
                this.#board,
                mode,
                this.subscriber,
                this.subscriber,
                this.publisher
            )
        })
    }
    
    async onExit() {
        await this.#subscription.unsubscribe()
    }

    canTransitionTo(stateInterface: FunctionConstructor) {
        return [IdleState, GameState].includes(stateInterface)
    }
}