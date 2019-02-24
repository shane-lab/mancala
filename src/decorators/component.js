import { templated } from '../util/dom'

type ComponentDetails = {
    selector: string,
    template: string,
    style?: string
}

export const Component = (details: ComponentDetails) => {
    const { selector, template, style } = details
    return function (target) {
        target.componentClass = target
        return class extends target {
            constructor(rootNode: HTMLElement | BaseComponent, ...args) {
                super(...args)

                this.rootNode = rootNode
                this.template = templated(template, selector, this.onCreate ? this.onCreate.bind(this) : void 0)
                
                this.querySelector = this.template.querySelector.bind(this.template)
                
                this.appendChild(this.template)
                .then(data => this.onMounted ? this.onMounted(data.node, data.elem) : void 0)
                .then(() => {
                    if (!style)
                        return

                    const css = style.replace(':root', selector)
                    
                    const styleEl = document.createElement('style')
                    styleEl.type = 'text/css'
                    if (styleEl.styleSheet)
                        styleEl.styleSheet.css = css
                    else
                        styleEl.appendChild(document.createTextNode(css))

                    this.template.appendChild(styleEl)
                    
                    // todo checkout shadowdom api v1
                    // const content = this.template.content
                    // const shadow = this.template.attachShadow({mode: 'closed'})
                    // shadow.appendChild(content.cloneNode(true))
                    // // console.log(!!document.querySelector(selector).createShadowRoot)
                })
                // .then(() => {
                //     if (this.rootNode instanceof HTMLElement)
                //         return
                    
                //     console.log(this.rootNode)
                // })
            }

            async appendChild(elem: HTMLElement) {
                let node: HTMLElement = this.rootNode instanceof HTMLElement ? this.rootNode : this.rootNode.rootNode
                
                if (!node || (node && !(node instanceof HTMLElement)))
                    throw new Error('root is not an instanceof HTMLElement')
                
                node.appendChild(elem)

                return {node, elem}
            }
        }
    }
}