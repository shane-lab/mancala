import { Board } from '../models/board'

import { StoreComponent } from './store-component'
import { LaneComponent } from './lane-component'

import SIDES from '../shared/sides'

import { Component } from '../decorators/component'

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
    storeA: StoreComponent // opponent store
    storeB: StoreComponent // player store
    laneA: LaneComponent // opponent lane
    laneB: LaneComponent // opponent lane
    constructor(board: Board) {
        this.board = board;
    }
    
    onMounted(parent: HTMLElement, elem: HTMLElement) {
        const boardEl = this.querySelector('.board')
            
        this.storeA = new StoreComponent(boardEl, SIDES.OPPONENT, this.board.storeA)
        this.storeB = new StoreComponent(boardEl, SIDES.PLAYER, this.board.storeB)

        const gridEl = document.createElement('div')
        gridEl.className = 'grid'

        boardEl.appendChild(gridEl)

        const length = this.board.pockets.length
        const center = length / 2

        this.laneA = new LaneComponent(gridEl, SIDES.OPPONENT, this.board.pockets.slice(0, center - 1))
        this.laneB = new LaneComponent(gridEl, SIDES.PLAYER, this.board.pockets.slice(center, length - 1))
    }
}