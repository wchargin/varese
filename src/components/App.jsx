import React, {Component} from 'react';

import RationalizerConfig from './RationalizerConfig';

export default class App extends Component {
    render() {
        return <div className="container">
            <h1>Hello, app!</h1>
            <RationalizerConfig />
        </div>;
    }
}
