import { Component } from '../decorators/component'

import { Pocket } from '../models/pocket'

import { bind } from '../util/bind'

@Component({
    selector: 'pocket-component',
    template: `
        <div class="pocket" data-id=0 data-score=0></div>
    `
})
export class PocketComponent {
    constructor(pocket: Pocket, clickHandler: (x: Pocket) => void) {
        this.pocket = pocket
        this.clickHandler = clickHandler
    }

    onCreate(elem: HTMLElement) {
        const pocketEl = elem.querySelector('.pocket')

        pocketEl.setAttribute('data-id', this.pocket.index)
        pocketEl.setAttribute('data-score', this.pocket.score)

        bind(this.pocket, 'score', v => pocketEl.setAttribute('data-score', v))
    }

    onMounted(parent: HTMLElement, elem: HTMLElement) {
        const pocketEl = elem.querySelector('.pocket')
        pocketEl.onclick = e => this.clickHandler(this.pocket)
    }
}