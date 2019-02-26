import { Component } from '../decorators/component'

import { bind } from '../util/bind'

type ToastComponentDetails = {
    title: string,
    message: string,
    type: 'info'|'warn'|'error'|'debug',
    position: string,
    closeCb?: (e: Event) => void
}

const insertHTML = (elem: HTMLElement, v: HTMLElement | string) => {
    while (elem.firstChild)
        myNode.removeChild(myNode.firstChild)

    if (v instanceof HTMLElement)
        elem.insertAdjacentElement('afterbegin', v)
    else
        elem.insertAdjacentHTML('afterbegin', v)
}

@Component({
    selector: 'toast-component',
    template: `
        <div class="toast">
            <button class="close" role="button">&times;</button>
            <div class="title"></div>
            <div class="message"></div>
        </div>
    `
})
export class ToastComponent {
    #details: ToastComponentDetails
    constructor(details: ToastComponentDetails) {
        this.#details = details
    }

    onCreate(elem: HTMLElement) {
        elem.classList.add(`toast-${this.#details.position}`)
        
        const toastEl = elem.querySelector('.toast')
        toastEl.classList.add(`toast-${this.#details.type}`)

        const titleEl = elem.querySelector('.title')
        titleEl.innerText = this.#details.title
        const messageEl = elem.querySelector('.message')
        messageEl.innerText = this.#details.message

        bind(this.#details, 'title', v => titleEl.innerText = v)
        bind(this.#details, 'message', v => messageEl.innerText = v)

        const buttonEl = elem.querySelector('.close')
        buttonEl.onclick = this.#details.closeCb
    }
}