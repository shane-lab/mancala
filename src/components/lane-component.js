import { Component } from '../decorators/component'

import { PocketComponent } from './pocket-component'

import { Pocket } from '../models/pocket'

import SIDES from '../shared/sides'

import { hasValueOf } from '../util/minidash'
import { bind } from '../util/bind'

@Component({
    selector: 'lane-component',
    template: `
        <div class="lane"></div>
    `,
    style: `
        :root {
            display: flex;
            width: 100%;
        }
    `
})
export class LaneComponent {
    pocketComponents: PocketComponent[] = []
    /// side = either PLAYER or OPPONENT side
    constructor(side: Symbol, pockets: Pocket[]) {
        if (!hasValueOf(SIDES, side))
            throw new Error('the given side is not a valid player side')
        this.side = side
        this.pockets = pockets
    }

    onCreate(elem: HTMLElement) {
        const laneEl = elem.querySelector('.lane')

        laneEl.classList.add(this.side === SIDES.PLAYER ? 'player' : 'opponent')
    }

    onMounted(parent: HTMLElement, elem: HTMLElement) {
        const laneEl = this.querySelector('.lane')

        for (let i = 0; i < this.pockets.length; i++)
            this.pocketComponents.push(new PocketComponent(laneEl, this.pockets[i]))
    }
}