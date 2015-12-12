/*
 * Connect a Redux store to the LocalStore localStorage layer,
 * such that the Redux store is serialized (as JSON) to localStorage
 * immediately after every change to the store,
 * and can be rehydrated when the application first launches.
 *
 * This exposes two functions: 'createListener' and 'createRehydrationAction'.
 * You should first call 'createRehydrationAction' (with no arguments)
 * and dispatch the resulting action to the store.
 * Then, you should call 'createListener' (passing in the store)
 * and add the resulting listener as a subscriber to the store.
 *
 * Or, you can just call the default export 'setUp',
 * which does all that for you; just pass in your store as an argument.
 */

import LocalStore from './LocalStore';
import * as Actions from './Actions';

const LOCAL_STORE_KEY = 'redux_state';

export function createListener(store) {
    return function listener() {
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

export default function setUp(store) {
    store.dispatch(createRehydrationAction());
    store.subscribe(createListener(store));
}
