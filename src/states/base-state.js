import { State } from '../fsm/state'

type SubscriptionHandler = (...args) => void

declare type Subscription = { unsubscribe(): Promise<void> | void }

declare type Subscriber = (selector, handler: SubscriptionHandler) => Subscription

declare type Publisher = (selector, ...args) => void

export class BaseState extends State {
    constructor(subscriber: Subscriber, publisher: Publisher) {
        super()

        this.subscriber = subscriber
        this.publisher = publisher
    }
}