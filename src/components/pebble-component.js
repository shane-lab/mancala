import { Component } from '../decorators/component'

import { Pebble } from '../models/pebble'
import { STORE_A, STORE_B } from '../models/board'

import { shuffle, between } from '../util/minidash'
import { bind } from '../util/bind'
import { offset } from '../util/dom'

const VARIANTS = ['red', 'green', 'blue', 'yellow']

const dockPebble = (elem: HTMLElement, host: HTMLElement) => {
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

    const style = `translate3d(${originX}px, ${originY}px, 0)`

    elem.onclick = host.onclick

    elem.style.transform = style

    return elem
}

@Component({
    selector: 'pebble-component',
    template: `
        <div class="pebble">
        </div>
    `
})
export class PebbleComponent {
    constructor(pebble: Pebble) {
        this.pebble = pebble
    }

    get id() {
        return this.pebble.host.index
    }

    onCreate(elem: HTMLElement) {
        const color = shuffle(VARIANTS)[0]

        const pebbleEl = elem.querySelector('.pebble')
        pebbleEl.classList.add(color)
        
        bind(this.pebble, 'host', v => dockPebble(pebbleEl, this.#findHostElement()))
    }
    
    onMounted(parent: HTMLElement, elem: HTMLElement) {
        const pebbleEl = this.querySelector('.pebble')

        // wait 1 tick 
        setTimeout(() => dockPebble(pebbleEl, this.#findHostElement()), 1);
    }

    // dirty dom lookup
    #findHostElement() {
        let selector = `pocket-component > .pocket[data-id="${this.pebble.host.index}"]`
        if (this.id === STORE_A || this.id === STORE_B)
            selector = `store-component > ${'.'.concat(this.id === STORE_A ? 'opponent' : 'player')} > .store`
        return document.querySelector(selector)
    }
}
