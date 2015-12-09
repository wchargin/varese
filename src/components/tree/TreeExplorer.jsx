import React, {Component} from 'react';

import Page from './../Page';
import TrichordTree from './TrichordTree';

export default class App extends Component {
    render() {
        return <Page path="tree">
            <h1>Coming soon!</h1>
            <TrichordTree
                rootChord={[0, 4, 7]}
                levels={4}
            />
        </Page>;
    }
}
