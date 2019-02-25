const bimap = (map: object) => ({
    ['map']: { ...map},
    ['inverse']: Object.keys(map).reduce((prev, key) => {
        const value = map[key]
        return { ...prev, [value]: key}
    }, {})
})

export default bimap