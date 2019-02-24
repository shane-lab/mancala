/**
 * simple one-way binding to an arbitrary object
 */
export const bind = (model: object, property: string, handler: (...args) => void) => {
    let oldValue = model[property]
    Object.defineProperty(model, property, {
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