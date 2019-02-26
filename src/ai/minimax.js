const evaluate = (state) => 0

const minimax = (winCondition:(state) => boolean) => (state, depth: number, maximizing: boolean) => {
    let best
    if (maximizing)
        best = [-1, -1, Number.NEGATIVE_INFINITY]
    else
        best = [+1, +1, Number.POSITIVE_INFINITY]

    if (depth === 0 || winCondition(state)) 
        return [-1, -1, evaluate(state)]

    return best
}