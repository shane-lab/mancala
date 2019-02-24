import LightEventBus from 'light-event-bus'

import { State } from '../fsm/state'
import { IdleState } from './idle-state'

import { offset } from '../util/dom'

const { EventBus } = LightEventBus

const OPPONENT_HANDLE = 0
const PLAYER_HANDLE = 1

const VARIANTS = ['red', 'blue', 'green', 'yellow']

type PlayerSide = typeof OPPONENT_HANDLE | typeof PLAYER_HANDLE

type PocketClickHandler = (side: PlayerSide, pocketId: number) => void

type Point = { x: number, y: number }
type Size = { width: number, height: number }

const between = (min, max) => (Math.random() * (max - min) + min)

const shuffle = (arr: Array | ArrayLike) => arr.map((a) => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map((a) => a[1])

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

    const { prevHost } = elem
    if (prevHost)
        prevHost.setAttribute('data-score', +(prevHost.getAttribute('data-score') || 0) - 1)

    host.setAttribute('data-score', +(host.getAttribute('data-score') || 0) + 1)

    elem.onclick = host.onclick

    elem.style.transform = style

    elem.prevHost = host

    return elem
}

const createPebbleElement = (host: HTMLElement, variant?: Variant) => {
    const elem = document.createElement('div')
    elem.classList.add('pebble', variant)

    elem.restore = () => dockPebble(elem, host)

    return dockPebble(elem, host)
}

const createPocketElement = (i: number, side: PlayerSide, handler: PocketClickHandler) => {
    const isPlayer = side === PLAYER_HANDLE

    // rendering is inversed id for opponent (retaining counter-clockwise)
    const actualId = isPlayer ? i : 6 - (i + 1)

    const elem = document.createElement('div')
    elem.className = 'pocket'
    elem.setAttribute('data-id', actualId)
    elem.setAttribute('data-score', 0)

    // elem.onclick = (evt) => handler(side, actualId)

    return elem
}

const createLaneElement = (side: PlayerSide, handler: PocketClickHandler) => {
    const isPlayer = side === PLAYER_HANDLE

    const elem = document.createElement('div')
    elem.classList.add('lane', (isPlayer ? 'player' : 'opponent'))
    elem.setAttribute('data-side', side)

    for (let i = 0; i < 6; i++)
        elem.appendChild(createPocketElement(!isPlayer ? i : 6 + (i + 1), side, handler))

    return elem
}

const createStoreElement = (side: PlayerSide) => {
    const isPlayer = side === PLAYER_HANDLE

    const elem = document.createElement('div')
    elem.classList.add('store-wrapper', (isPlayer ? 'player' : 'opponent'))
    elem.setAttribute('data-side', side)

    const childElem = document.createElement('div')
    childElem.className = 'store'
    childElem.setAttribute('data-score', 0)

    elem.appendChild(childElem)

    return elem
}

export class SetupState extends State {
    #domInteractive = false
    #root: HTMLElement

    constructor(element: HTMLElement) {
        super()
        this.#root = element
    }

    async onEnter(transitionTo) {

        const { subscribe, publish } = new EventBus

        const observe = fn => (side, pocketId): PocketClickHandler => fn({ side, pocketId })

        const publisher = selector => (...args) => publish(selector, ...args)

        const $producer = observe(publisher('pocket_select'))

        const showMenu = flag => publisher('menu')(flag)

        /// render board
        const wrapperEl = document.createElement('div')
        wrapperEl.className = 'board-wrapper'

        this.#root.appendChild(wrapperEl)

        const boardEl = document.createElement('div')
        boardEl.className = 'board'

        wrapperEl.appendChild(boardEl)

        // append opponent store component
        const p2StoreEl = createStoreElement(OPPONENT_HANDLE)
        boardEl.appendChild(p2StoreEl)
        // append player store component
        const p1StoreEl = createStoreElement(PLAYER_HANDLE)
        boardEl.appendChild(p1StoreEl)

        const gridEl = document.createElement('div')
        gridEl.className = 'grid'

        boardEl.appendChild(gridEl)

        // append opponent lane component
        const p2LaneEl = createLaneElement(OPPONENT_HANDLE, $producer)
        gridEl.appendChild(p2LaneEl)
        // append player lane component
        const p1LaneEl = createLaneElement(PLAYER_HANDLE, $producer)
        gridEl.appendChild(p1LaneEl)

        /// render pebbles
        const pebblesEl = document.createElement('div')
        pebblesEl.className = 'pebbles-container'

        boardEl.appendChild(pebblesEl)

        for (let lane of [p1LaneEl, p2LaneEl]) 
            for (let pocket of lane.querySelectorAll('.pocket')) {               
                const variants = shuffle(VARIANTS) // just to change order of appearance
                for (let i = 0; i < VARIANTS.length; i++)
                    pebblesEl.appendChild(createPebbleElement(pocket, variants[i]))
            }

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