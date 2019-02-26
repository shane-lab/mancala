import { Injectable, Inject } from '../decorators/injector'

import { DomEffectsService } from './dom-effects-service'

import { ToastComponent } from '../components/toast-component'

import uuidv4 from '../util/uuidv4'

export const ToastType = {
    Error: 'error',
    Info: 'info',
    Success: 'success',
    Warning: 'warning'
}

export const ToastPosition = {
    TopLeft: 'top-left',
    TopRight: 'top-right',
    TopCenter: 'top-center',
    TopFullWidth: 'top-full-width',
    BottomLeft: 'bottom-left',
    BottomRight: 'bottom-right',
    BottomCenter: 'bottom-center',
    BottomFullWidth: 'bottom-full-width'
}

const hostId = `toast-container-${uuidv4()}`

const defaults = {
    debug: false,
    position: ToastPosition.TopRight,
    startingZIndex: 1000,
    autoClose: true,
    closeInterval: 1500
}

type ToastOptions = typeof defaults

@Injectable()
export class ToastService {

    @Inject(DomEffectsService)
    domEffectsService: DomEffectsService

    error(message: string, title: string, options?: ToastOptions) {
        return this.#notify(ToastType.Error, message, title, options)
    }

    info(message: string, title: string, options?: ToastOptions) {
        return this.#notify(ToastType.Info, message, title, options)
    }

    success(message: string, title: string, options?: ToastOptions) {
        return this.#notify(ToastType.Success, message, title, options)
    }

    warning(message: string, title: string, options?: ToastOptions) {
        return this.#notify(ToastType.Warning, message, title, options)
    }

    #notify(type, message: string, title: string, options?: ToastOptions) {

        let hostEl = document.getElementById(hostId)
        if (!hostEl) {
            hostEl = document.createElement('div')
            hostEl.id = hostId

            document.body.appendChild(hostEl)
        } else {
            let elem
            while (elem = hostEl.firstChild) 
                hostEl.removeChild(elem)
        }

        const details = Object.assign({}, defaults, options || {}, {
            type,
            message,
            title,
            closeCb: e => this.#remove(hostEl)
        });

        const toastComponent = new ToastComponent(hostEl, details)

        if (details.autoClose)
            setTimeout(() => this.#remove(hostEl), details.closeInterval)
    }

    #remove(elem: HTMLElement) {
        this.domEffectsService.fadeOut(elem, {
            duration: 500,
            complete: () => {
                try {
                    document.body.removeChild(elem)
                } catch (e) { }
            }
        })
    }
}