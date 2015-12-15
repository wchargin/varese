import React, {Component} from 'react';
import {Router, Route, Redirect} from 'react-router';

import PitchCalculator from './calculator/PitchCalculator';
import TreeExplorer from './tree/TreeExplorer';
import InfiniteTreeExplorer from './inftree/InfiniteTreeExplorer';

export default class App extends Component {
    render() {
        return <div>
            <Router>
                <Redirect from="/" to="calculator" />
                <Route path="calculator" component={PitchCalculator} />
                <Route path="tree" component={TreeExplorer} />
                <Route path="infinite-tree" component={InfiniteTreeExplorer} />
            </Router>
        </div>;
    }
}
