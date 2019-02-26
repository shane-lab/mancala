import { Component } from '../decorators/component'
import { Check } from '../decorators/check';

import { Pebble } from '../models/pebble'
import { STORE_A, STORE_B } from '../models/board'

import { shuffle, between } from '../util/minidash'
import { bind } from '../util/bind'
import { offset } from '../util/dom'

const VARIANTS = ['red', 'green', 'blue', 'yellow']

const style = (x: number, y: number) => `translate3d(${x}px, ${y}px, 0)`

const dock = (elem: HTMLElement, host: HTMLElement) => {
    if (!host)
        return elem.style.display = 'none'
    
    elem.style.display = 'block'
    
    const topLeft = offset(host)
    const width = host.clientWidth
    const height = host.clientHeight
    topLeft.x += width / 2
    topLeft.y += height / 2

    const ww = (width / 2) / 2
    const hh = (height / 2) / 2

    const marginLeft = between(-Math.abs(ww), ww)
    const marginTop = between(-Math.abs(hh), hh)

    const originX = topLeft.x - (50 / 2) + marginLeft
    const originY = topLeft.y - (50 / 2) + marginTop
    elem.setAttribute('data-origin-x', originX)
    elem.setAttribute('data-origin-y', originY)

    elem.onclick = host.onclick

    elem.style.transform = style(originX, originY)
}

@Component({
    selector: 'pebble-component',
    template: `
        <div class="pebble">
        </div>
    `
})
export class PebbleComponent {
    #pebble: Pebble
    constructor(pebble: Pebble) {
        this.#pebble = pebble
    }

    get id() {
        let id
        try {
            id = this.#pebble.host.index
        } catch (e) { }

        return id
    }

    onCreate(elem: HTMLElement) {
        const color = shuffle(VARIANTS)[0]

        const pebbleEl = elem.querySelector('.pebble')
        pebbleEl.classList.add(color)

        pebbleEl.style.transform = style(window.innerWidth / 2 - 25, window.innerHeight / 2 - 25)
        
        bind(this.#pebble, 'host', v => dock(pebbleEl, this._findHostElement()))

        window.addEventListener('resize', e => dock(pebbleEl, this._findHostElement()))

        dock(pebbleEl, this._findHostElement())
    }
    
    onMounted(parent: HTMLElement, elem: HTMLElement) {
        const pebbleEl = this.querySelector('.pebble')

        // wait 1 tick 
        setTimeout(() => dock(pebbleEl, this._findHostElement()), 1);
    }

    // dirty dom lookup
    @Check((self: PebbleComponent) => self.id !== undefined, true)
    _findHostElement() {
        let selector = `pocket-component > .pocket[data-id="${this.id}"]`
        if (this.id === STORE_A || this.id === STORE_B)
            selector = `store-component > ${'.'.concat(this.id === STORE_A ? 'opponent' : 'player')} > .store`
        return document.querySelector(selector)
    }
}
