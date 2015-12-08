import React, {Component} from 'react';

import RationalizerConfig from './RationalizerConfig';

export default class App extends Component {
    render() {
        return <div className="container">
            <h1>Var&egrave;se pitch calculator</h1>
            <RationalizerConfig />
        </div>;
    }
}
