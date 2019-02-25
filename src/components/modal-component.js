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
    constructor(modalDetails: ModalComponentDetails) {
        this.modalDetails = modalDetails
    }
    
    onCreate(elem: HTMLElement) {
        const titleEl = elem.querySelector('.title')
        titleEl.innerText = this.modalDetails.title
        const messageEl = elem.querySelector('.message')
        messageEl.innerText = this.modalDetails.message
        const templateEl = elem.querySelector('.slot')
        if (this.modalDetails.shown === false)
            elem.style.display = 'none'

        const initialDisplay = elem.style.display || 'block'
        
        bind(this.modalDetails, 'title', v => titleEl.innerText = v)
        bind(this.modalDetails, 'message', v => messageEl.innerText = v)
        bind(this.modalDetails, 'shown', v => elem.style.display = v ? initialDisplay : 'none')

        if ('template' in this.modalDetails) {
            insertHTML(templateEl, this.modalDetails.template)

            bind(this.modalDetails, 'template', v => insertHTML(templateEl, v))
        }
    }
}