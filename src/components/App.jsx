import React, {Component} from 'react';
import {Router, Route, Link, Redirect} from 'react-router';

import PitchCalculator from './PitchCalculator';
import TreeExplorer from './TreeExplorer';

export default class App extends Component {
    render() {
        return <div>
            <Router>
                <Redirect from="/" to="calculator" />
                <Route path="calculator" component={PitchCalculator} />
                <Route path="tree" component={TreeExplorer} />
            </Router>
        </div>;
    }
}
