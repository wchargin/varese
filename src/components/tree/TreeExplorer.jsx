import React, {Component} from 'react';
import {connect} from 'react-redux';

import {extendRationalizer} from '../../core/HarmonicSeries';

import {mapStateToProps, mapDispatchToProps} from '../TreeReduxBindings';
import ChordInput from '../ChordInput';
import Page from './../Page';
import RationalizerSettings from '../settings/RationalizerSettings';
import TrichordTree from './TrichordTree';
import ViewOptions from '../settings/ViewOptions';

class TreeExplorer extends Component {

    constructor() {
        super();
        this.state = {
            rootChord: [0, 4, 7],
        };
    }

    /* eslint-disable react/prop-types */
    render() {
        return <Page path="tree">
            <h1>Chord tree explorer</h1>
            <p>
            Explore the outfoldings of a particular trichord.
            Branches to the left are outfoldings down,
            and branches to the right are outfoldings up.
            </p>
            <p>
            <strong>Click</strong> on any chord to set it as the root,
            or <strong>type</strong> a root chord manually
            in the text box below.
            </p>
            <p>
            <strong>Hover</strong> over a chord to see it engraved on a staff!
            </p>
            <ChordInput
                value={this.state.rootChord}
                message="Enter a trichord: "
                onChange={rootChord => this.setState({ rootChord })}
                exactly={3}
            />
            <ViewOptions
                infinite={false}
                values={this.props.treeViewOptions}
                handlers={this.props.viewOptionsHandlers}
            />
            <TrichordTree
                rationalizer={extendRationalizer(this.props.acousticRatios)}
                rootChord={this.state.rootChord}
                onClickChord={rootChord => this.setState({ rootChord })}
                viewOptions={this.props.treeViewOptions}
            />
            {this.props.rootsVisible &&
                <RationalizerSettings
                    values={this.props.acousticRatios}
                    onChangeValue={this.props.onSetAcousticRatio}
                />}
        </Page>;
    }
    /* eslint-enable */

}

export default connect(mapStateToProps, mapDispatchToProps)(TreeExplorer);
