import LightEventBus from 'light-event-bus'

import { State } from '../fsm/state'

import { IdleState } from './idle-state'

import { Board } from '../models/board'

import { BoardComponent } from '../components/board-component'

const { EventBus } = LightEventBus

export class SetupState extends State {
    #domInteractive = false
    #root: HTMLElement

    constructor(element: HTMLElement) {
        super()
        this.#root = element
    }

    async onEnter(transitionTo) {

        const board = new Board

        const { publish, subscribe } = new EventBus

        const boardWrapperEl = new BoardComponent(this.#root, board)

        transitionTo(
            IdleState,
            (selector, handler) => subscribe(selector, handler),
            (selector, ...args) => publish(selector, ...args)
        )
    }

    canTransitionTo(stateInterface: FunctionConstructor) {
        return stateInterface === IdleState
    }
}