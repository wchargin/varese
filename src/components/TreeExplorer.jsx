import React, {Component} from 'react';

import Navbar from './Navbar';

export default class App extends Component {
    render() {
        return <div>
            <Navbar here="tree" />
            <div className="container">
                <h1>Coming soon!</h1>
            </div>
        </div>;
    }
}
