import LightEventBus from 'light-event-bus'

import { State } from '../fsm/state'

import { IdleState } from './idle-state'

import { Board } from '../models/board'
import { Pocket } from '../models/pocket'

import { BoardComponent } from '../components/board-component'
import { ModalComponent } from '../components/modal-component'

import SIDES from '../shared/sides'
import MODES from '../shared/modes'
import STATES from '../shared/states'
import { Inject } from '../decorators/injector';
import { ToastService, ToastPosition } from '../services/toast-service';
import { PlayerIndicatorComponent } from '../components/player-indicator-component';
import delay from '../util/delay';
import MOVES from '../shared/moves';

const { EventBus } = LightEventBus

export class SetupState extends State {
    #domInteractive = false
    #root: HTMLElement

    @Inject(ToastService)
    toastService: ToastService

    constructor(element: HTMLElement) {
        super()
        this.#root = element
    }

    async onEnter(transitionTo) {

        const { publish, subscribe } = new EventBus
        
        const board = new Board

        const boardComponent = new BoardComponent(this.#root, board, (pocket: Pocket) => publish(STATES.POCKET_SELECT, pocket.index))

        const modalDetails = {
            title: 'Game select',
            message: 'Play Mancala VS an other player or computer',
            shown: true,
            template: (() => {
                const container = document.createElement('div')
                const button0 = document.createElement('button')
                button0.innerText = 'VS Player'
                const button1 = document.createElement('button')
                button1.innerText = 'VS Computer'
                button1.disabled = true

                container.appendChild(button0)
                container.appendChild(button1)

                button0.addEventListener('click', e => publish(STATES.PLAY, MODES.PVP))
                button1.addEventListener('click', e => publish(STATES.PLAY, MODES.PVE))

                return container
            })()
        }

        const modalComponent = new ModalComponent(this.#root, modalDetails)

        const indicatorDetails = { turn: -1 }

        const indicatorComponent = new PlayerIndicatorComponent(this.#root, indicatorDetails)

        let turns = 0
        subscribe(STATES.PLAY, _ => (modalDetails.shown = false, turns = 0))
        subscribe(STATES.SWITCH_TURN, (side: Symbol) => {
            indicatorDetails.turn = side
            if (turns === 0) 
                this.toastService.info(`${side === SIDES.PLAYER ? 'Bottom':'Top'} player starts with the game`, 'Game started', {
                    position: ToastPosition.TopCenter
                })
            
            ++turns
        })
        subscribe(STATES.VICTOR, async (side: Symbol) => {
            this.toastService.success(`${side === SIDES.PLAYER ? 'Bottom': 'Top'} player has won the game`, 'Game ended', {
                position: ToastPosition.TopCenter,
                closeInterval: 2500
            })

            await delay(1000)

            modalDetails.shown = true
        })
        subscribe(STATES.POCKET_SELECTED, (move: Symbol) => {
            if (move === MOVES.ILLEGAL || move === MOVES.WAITING)
                this.toastService.warning('You can not select this pocket', 'Wrong pocket', {
                    position: ToastPosition.BottomCenter
                })
        })

        transitionTo(
            IdleState,
            board,
            (selector, handler) => subscribe(selector, handler),
            (selector, ...args) => publish(selector, ...args)
        )
    }

    canTransitionTo(stateInterface: FunctionConstructor) {
        return stateInterface === IdleState
    }
}