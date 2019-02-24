export const offset = (el: HTMLElement, x = 0, y = 0): { x: number, y: number } => {
    if (!el || isNaN(el.offsetLeft) || isNaN(el.offsetTop))
        return { x, y }

    x += el.offsetLeft - el.scrollLeft
    y += el.offsetTop - el.scrollTop
    return offset(el.offsetParent, x, y)
}