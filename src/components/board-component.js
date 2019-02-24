import { Component } from '../decorators/component'

import { StoreComponent } from './store-component'
import { LaneComponent } from './lane-component'
import { PebbleComponent } from './pebble-component'

import { Board } from '../models/board'

import SIDES from '../shared/sides'

@Component({
    selector: 'board-component',
    template: `
        <div class="board-wrapper">
            <div class="board">
            </div>
        </div>
    `
})
export class BoardComponent {
    storeComponentA: StoreComponent // opponent store
    storeComponentB: StoreComponent // player store
    laneComponentA: LaneComponent   // opponent lane
    laneComponentB: LaneComponent   // player lane
    pebbleComponents: PebbleComponent[] = []
    constructor(board: Board) {
        this.board = board
    }
    
    onMounted(parent: HTMLElement, elem: HTMLElement) {
        const boardEl = this.querySelector('.board')
            
        this.storeComponentA = new StoreComponent(boardEl, SIDES.OPPONENT, this.board.storeA)
        this.storeComponentB = new StoreComponent(boardEl, SIDES.PLAYER, this.board.storeB)

        const gridEl = document.createElement('div')
        gridEl.className = 'grid'

        boardEl.appendChild(gridEl)

        const length = this.board.pockets.length
        const center = length / 2

        this.laneComponentA = new LaneComponent(gridEl, SIDES.OPPONENT, this.board.pockets.slice(0, center - 1))
        this.laneComponentB = new LaneComponent(gridEl, SIDES.PLAYER, this.board.pockets.slice(center, length - 1))

        for (let i = 0; i < this.board.pebbles.length; i++)
            this.pebbleComponents.push(new PebbleComponent(elem, this.board.pebbles[i]))
    }
}