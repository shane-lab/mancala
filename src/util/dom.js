export const offset = (el: HTMLElement, x = 0, y = 0): { x: number, y: number } => {
    if (!el || isNaN(el.offsetLeft) || isNaN(el.offsetTop))
        return { x, y }

    x += el.offsetLeft - el.scrollLeft
    y += el.offsetTop - el.scrollTop
    return offset(el.offsetParent, x, y)
}

export const templated = (template: string, selector = 'div', fn?: (elem: HTMLElement) => void) => {
    const elem = document.createElement(selector)
    elem.innerHTML = template

    if (fn && typeof fn === 'function')
        fn(elem)

    return elem
}