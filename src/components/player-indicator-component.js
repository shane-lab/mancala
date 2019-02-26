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
    `
})
export class PlayerIndicatorComponent {
    #details: PlayerIndicatorComponentDetails
    constructor(details: PlayerIndicatorComponentDetails) {
        this.#details = details
    }

    onCreate(elem: HTMLElement) {
        const indicatorEl = elem.querySelector('.player-indicator')
        indicatorEl.style.display = 'none'

        const playerEl = elem.querySelector('.player')
        const opponentEl = elem.querySelector('.opponent')

        bind(this.#details, 'turn', v => {
            if (!hasValueOf(SIDES, v))
                return indicatorEl.style.display = 'none'

            if (v === SIDES.PLAYER) 
                this.#setActive(playerEl, opponentEl)
            else 
                this.#setActive(opponentEl, playerEl)
            
            indicatorEl.style.display = 'flex'
        })
    }

    #setActive(activeEl: HTMLElement, inactiveEl: HTMLElement) {
        activeEl.classList.add('active')
        inactiveEl.classList.remove('active')
    }
}