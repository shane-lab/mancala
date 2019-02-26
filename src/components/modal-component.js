import { Component } from '../decorators/component'

import { Pocket } from '../models/pocket'

import SIDES from '../shared/sides'

import { hasValueOf } from '../util/minidash'
import { bind } from '../util/bind'
import { templated } from '../util/dom'

type ModalComponentDetails = {
    title: string,
    message: string,
    shown: boolean,
    template?: string | HTMLElement
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
    selector: 'modal-component',
    template: `
        <div class="modal-wrapper">
            <div class="modal">
                <div class="content">
                    <h1 class="title"></h1>
                    <p class="message"></p>
                    <div class="slot"></div>
                </div>
            </div>
        </div>
    `
})
export class ModalComponent {
    #details: ModalComponentDetails
    constructor(details: ModalComponentDetails) {
        this.#details = details
    }
    
    onCreate(elem: HTMLElement) {
        const titleEl = elem.querySelector('.title')
        titleEl.innerText = this.#details.title
        const messageEl = elem.querySelector('.message')
        messageEl.innerText = this.#details.message
        const templateEl = elem.querySelector('.slot')
        if (this.#details.shown === false)
            elem.style.display = 'none'

        const initialDisplay = elem.style.display || 'block'
        
        bind(this.#details, 'title', v => titleEl.innerText = v)
        bind(this.#details, 'message', v => messageEl.innerText = v)
        bind(this.#details, 'shown', v => elem.style.display = v ? initialDisplay : 'none')

        if ('template' in this.#details) {
            insertHTML(templateEl, this.#details.template)

            bind(this.#details, 'template', v => insertHTML(templateEl, v))
        }
    }
}