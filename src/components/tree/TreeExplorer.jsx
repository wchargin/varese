import React, {Component} from 'react';

import Page from './../Page';
import TrichordTree from './TrichordTree';
import TreeSettings from './TreeSettings';
import ChordInput from '../ChordInput';

export default class TreeExplorer extends Component {

    constructor() {
        super();
        this.state = {
            rootChord: [0, 4, 7],
            settings: {
                levels: 4,
            }
        };
    }

    render() {
        const levels = this.state.settings.levels;
        const size = levels <= 4 ? 3 :
            levels <= 5 ? 2 :
            1;
        return <Page path="tree">
            <h1>Chord tree explorer</h1>
            <p>
            Explore the outfoldings of a particular trichord.
            Branches to the left are outfoldings down,
            and branches to the right are outfoldings up.
            </p>
            <p>
            Click on any chord to set it as the root,
            or enter a root chord manually in the text box below.
            </p>
            <ChordInput
                value={this.state.rootChord}
                message="Enter a trichord: "
                onChange={rootChord => this.setState({ rootChord })}
                exactly={3}
            />
            <TreeSettings
                value={this.state.settings}
                onChange={settings => this.setState({ settings })}
            />
            <TrichordTree
                rootChord={this.state.rootChord}
                levels={levels}
                size={size}
                onClickChord={rootChord => this.setState({ rootChord })}
            />
        </Page>;
    }

}
