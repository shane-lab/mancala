import { BaseState } from './base-state'

import { BoardService } from '../services/board-service'

import { Board } from '../models/board'
import { Inject } from '../decorators/injector'

export class IdleState extends BaseState {
    #board: Board

    @Inject(BoardService)
    boardService: BoardService

    constructor(board: Board, subscriber, publisher) {
        super(subscriber, publisher)
        this.#board = board
    }
}