import { Component } from '../decorators/component'

import { hasValueOf } from '../util/minidash'
import { bind } from '../util/bind'

@Component({
    selector: 'pebble-component',
    template: `
        <div class="pebble">
        </div>
    `
})
export class PebbleComponent {

}