import { BaseState } from './base-state'

export class IdleState extends BaseState {

    constructor(board: Board, subscriber, publisher) {
        super(subscriber, publisher)
    }
}