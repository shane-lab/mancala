/**
 * simple one-way binding to an arbitrary object and DOM node
 * @return {HTMLElement} Returns the node
 */
export const bind = (/*node: HTMLElement, */model: object, plucking: string, handler: (...args) => void) => {
    let oldValue = model[plucking]
    Object.defineProperty(model, plucking, {
        enumerable: true,
        configurable: true,
        set: function (value) {
            oldValue = value
            handler(value)
        },
        get: function () {
            return oldValue
        }
    })
}