require("babel-polyfill");
require("./LocalStore");

import React from 'react';
import ReactDOM from 'react-dom';

import {createStore} from 'redux';
import {Provider} from 'react-redux';
import Reducer from './Reducers';

import App from './components/App';
import setUpLocalStoreReduxInterface from './LocalStoreReduxInterface';

const store = createStore(Reducer);
setUpLocalStoreReduxInterface(store);

const component = <Provider store={store}>
    <App />
</Provider>;

ReactDOM.render(component, document.getElementById('app'));
