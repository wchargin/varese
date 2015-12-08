import React, {Component} from 'react';

import PitchCalculator from './PitchCalculator';
import TreeExplorer from './TreeExplorer';

export default class App extends Component {
    render() {
        return <div>
            <PitchCalculator />
            <TreeExplorer />
        </div>;
    }
}
