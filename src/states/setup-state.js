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

const { EventBus } = LightEventBus

export class SetupState extends State {
    #domInteractive = false
    #root: HTMLElement
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
                button0.addEventListener('click', e => publish(STATES.PLAY, MODES.PVE))

                return container
            })()
        }

        const modalComponent = new ModalComponent(this.#root, modalDetails)

        subscribe(STATES.PLAY, _ => modalDetails.shown = false)

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