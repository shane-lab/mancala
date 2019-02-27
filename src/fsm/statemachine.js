import { State } from './state'

const transitioner = (stateMachine: StateMachine, state: State) => async (stateInterface: FunctionConstructor, ...props) => {
    if (!stateInterface)
        return

    if (state) {
        if (!state.canTransitionTo(stateInterface))
            return

        await state.onExit()
    }

    if (stateMachine.exited)
        return

    const next = createState(stateInterface, ...props)

    stateMachine.current = next
    console.log(`transitioned from ${state.constructor.name} to ${stateInterface.name}`)
    stateMachine.current.onEnter(transitioner(stateMachine, next))
}

function createState(stateInterface: FunctionConstructor, ...props) {
    let state: State

    try {
        state = new stateInterface(...props)
    } catch (err) {
        throw err
    }
    return state
}

class StateMachine {
    constructor(state: State) {
        if (!state)
            throw new Error('No initial state was given')
        if (!(state instanceof State))
            throw new Error('The given initial state is not an instance of State')

        this.current = state
    }

    getStateId() {
        return this.current.constructor.name
    }

    async exit(kill) {
        if (!!this.exited)
            return

        this.exited = true
        await this.current.onExit()

        this.current.exited = true
    }
}

export default (stateInterface: FunctionConstructor, ...props) => {
    const initialState = createState(stateInterface, ...props)

    let stateMachine: StateMachine

    try {
        stateMachine = new StateMachine(initialState)
    } catch (err) {
        throw err
    }

    let exited = false

    try {
        initialState.onEnter(transitioner(stateMachine, initialState))
    } catch (err) {
        throw err
    }

    return {
        id() {
            return stateMachine.getStateId()
        },
        async stop(kill = false) {
            if (exited)
                return

            exited = true
            await stateMachine.exit(kill)
        }
    }
}
