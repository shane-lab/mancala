import createFSM from './fsm/statemachine'

import { SetupState } from './states/setup-state'

createFSM(SetupState, document.getElementById('app'))