import { Component } from '../decorators/component'

import { Pocket } from '../models/pocket'

import SIDES from '../shared/sides'

import { hasValueOf } from '../util/minidash'
import { bind } from '../util/bind'

@Component({
    selector: 'store-component',
    template: `
        <div class="store-wrapper">
            <div class="store" data-score=0></div>
        </div>
    `
})
export class StoreComponent {
    /// side = either PLAYER or OPPONENT side
    #side: Symbol
    #store: Pocket
    constructor(side: Symbol, store: Pocket) {
        if (!hasValueOf(SIDES, side))
            throw new Error('the given side is not a valid player side')
        this.#side = side
        this.#store = store
    }

    onCreate(elem: HTMLElement) {
        const wrapperEl = elem.querySelector('.store-wrapper')

        wrapperEl.classList.add(this.#side === SIDES.PLAYER ? 'player' : 'opponent')

        const storeEl = elem.querySelector('.store')

        bind(this.#store, 'score', v => storeEl.setAttribute('data-score', v))
    }
}