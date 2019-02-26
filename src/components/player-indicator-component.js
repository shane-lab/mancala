import { Component } from '../decorators/component'

import SIDES from '../shared/sides'

import { hasValueOf } from '../util/minidash'
import { bind } from '../util/bind'
import { templated } from '../util/dom'

type PlayerIndicatorComponentDetails = {
    turn: Symbol
}

@Component({
    selector: 'player-indicator-component',
    template: `
        <div class="player-indicator">
            <div class="avatar player" title="Player">P1</div>
            <div class="avatar opponent" title="Opponent">P2</div>
        </div>
    `,
    style: `
        :root {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
    `
})
export class PlayerIndicatorComponent {
    #details: PlayerIndicatorComponentDetails
    constructor(details: PlayerIndicatorComponentDetails) {
        this.#details = details
    }

    onCreate(elem: HTMLElement) {
        const playerEl = elem.querySelector('.player')
        const opponentEl = elem.querySelector('.opponent')

        bind(this.#details, 'turn', v => {
            if (v === SIDES.PLAYER) 
                this.#setActive(playerEl, opponentEl)
            else 
                this.#setActive(opponentEl, playerEl)
        })
    }

    #setActive(activeEl: HTMLElement, inactiveEl: HTMLElement) {
        activeEl.classList.add('active')
        inactiveEl.classList.remove('active')
    }
}