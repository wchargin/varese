import LocalStore from './LocalStore';
import * as Actions from './Actions';

const LOCAL_STORE_KEY = 'redux_state';

export function createListener(store) {
    return function(listener) {
        LocalStore.set(LOCAL_STORE_KEY, store.getState());
    };
}

export function createRehydrationAction() {
    // STOPSHIP
    return Actions.noop();
}
