export class State {
    constructor() {
        if (new.target === State)
            throw new Error('State is abstract')
    }

    onEnter(transitionTo: Transitioner) {
        return Promise.resolve()
    }

    onExit() {
        return Promise.resolve()
    }

    canTransitionTo(stateInterface: FunctionConstructor) {
        return false
    }
}
