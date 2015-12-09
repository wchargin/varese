import React, {Component} from 'react';

import Page from './../Page';
import TrichordTree from './TrichordTree';
import ChordInput from '../ChordInput';

export default class App extends Component {

    constructor() {
        super();
        this.state = {
            rootChord: [0, 4, 7],
        };
    }

    render() {
        return <Page path="tree">
            <h1>Coming soon!</h1>
            <ChordInput
                value={this.state.rootChord}
                onChange={rootChord => this.setState({ rootChord })}
            />
            <TrichordTree
                rootChord={this.state.rootChord}
                levels={4}
                onClickChord={rootChord => this.setState({ rootChord })}
            />
        </Page>;
    }

}
