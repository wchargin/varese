import LocalStore from './LocalStore';
import * as Actions from './Actions';

const LOCAL_STORE_KEY = 'redux_state';

export function createListener(store) {
    return function(listener) {
        LocalStore.set(LOCAL_STORE_KEY, store.getState());
    };
}

export function createRehydrationAction() {
    const storedState = LocalStore.get(LOCAL_STORE_KEY, undefined);
    if (storedState === undefined) {
        return Actions.noop();
    } else {
        return Actions.rehydrate(storedState);
    }
}
