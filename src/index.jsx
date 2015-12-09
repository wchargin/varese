require("babel-polyfill");
import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
require("./LocalStore");

ReactDOM.render(<App />, document.getElementById('app'));
