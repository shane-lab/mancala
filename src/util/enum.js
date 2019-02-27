export const enumerator = (...names: string[]): { [key: string]: Symbol } => Object.freeze(names.reduce((obj, v) => {
    obj[v.toUpperCase()] = Symbol(v)

    return obj
}, {}))