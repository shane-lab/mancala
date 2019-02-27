/*
 * miniature 'lodash'-like utility 
 */

/// spreads a plain object
export const spread = obj => Object.entries(obj).map(([key, value]) => ({ [key]: value }))

/// checks if a plain object contains a given value
export const hasValueOf = (obj, data) => Object.keys(obj).reduce((prev, key) => {
    if (prev === false)
        prev = obj[key] === data
    return prev
}, false)

/// picks a random number between the given max and minimum values
export const between = (min, max) => (Math.random() * (max - min) + min)

/// returns a new array with randomly shifted indexes
export const shuffle = (arr: Array | ArrayLike) => arr.map((a) => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map((a) => a[1])