import { BaseState } from './base-state'
import { IdleState } from './idle-state'

import { BoardService } from '../services/board-service'
import { MatchService } from '../services/match-service'

import { Board } from '../models/board'
import { Match } from '../models/match'

import STATES from '../shared/states'
import MODES from '../shared/modes'
import MOVES from '../shared/moves'
import SIDES from '../shared/sides'

import { Inject } from '../decorators/injector'

import { Bot } from '../ai/bot'

import { hasValueOf } from '../util/minidash'
import delay from '../util/delay'

export class GameState extends BaseState {
    #board: Board
    #mode: Symbol
    #match: Match
    #subscription: Subscription
    #moving = false
    #bot: Bot

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

        if (this.#mode === MODES.PVAI)
            this.#bot = new Bot(SIDES.OPPONENT, 9, -5000, 5000)
        
        this.publisher(STATES.SWITCH_TURN, this.#match.turn)

        this.#subscription = this.subscriber(STATES.POCKET_SELECT, async (pocketId: number) => {
            if (this.#moving)
                return
            
            this.#moving = true

            let side = this.boardService.getLaneByPocket(pocketId)

            let move = MOVES.ILLEGAL
            try {
                move = await this.matchService.move(this.#match, side, pocketId)
            } catch(e) { }

            this.publisher(STATES.POCKET_SELECTED, move)

            // when the move succeeded and the turn swapped and the player is against a bot, do bot move
            if (side === SIDES.PLAYER && move === MOVES.SUCCESS && this.#match.turn !== side && this.#bot) {
                try {
                    this.publisher(STATES.SWITCH_TURN, this.#match.turn)

                    await this._botMove()

                    side = this.#bot.side
                } catch(e) { console.log(e) }
            }
            
            let victor
            if (victor = this.matchService.getVictor(this.#match)) {

                transitionTo(
                    IdleState,
                    this.#match.board,
                    this.subscriber,
                    this.publisher
                )

                this.publisher(STATES.VICTOR, victor)
            } else {
                if (this.#match.turn !== side) 
                    this.publisher(STATES.SWITCH_TURN, this.#match.turn)
            }

            this.#moving = false
        })
    }

    async _botMove() {
        await delay(1000)

        console.log('AI STARTED THINKING')
        
        const id = await this.#bot.move(this.#match)
        const move = await this.matchService.move(this.#match, this.#bot.side, id)
        
        console.log(`AI IS DONE THINKING, IT TOOK POCKET ${id}`)

        if (move === MOVES.SUCCESS && this.#match.turn === this.#bot.side) {
            this.publisher(STATES.AI_RE_TURN, null)
            
            return this._botMove()
        }
    }
    
    async onExit() {
        await this.#subscription.unsubscribe()
    }

    canTransitionTo(stateInterface: FunctionConstructor) {
        return stateInterface === IdleState
    }
}