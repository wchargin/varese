require("babel-polyfill");
import React from 'react';
import ReactDOM from 'react-dom';

import {createStore} from 'redux';
import {Provider} from 'react-redux';
import Reducer from './Reducers';

import App from './components/App';
require("./LocalStore");

const store = createStore(Reducer);
const component = <Provider store={store}>
    <App />
</Provider>;
ReactDOM.render(component, document.getElementById('app'));
