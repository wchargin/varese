import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as Actions from '../../Actions';

import Page from './../Page';
import TrichordTree from './TrichordTree';
import ChordInput from '../ChordInput';
import RationalizerConfig from '../RationalizerConfig';

import {extendRationalizer} from '../../HarmonicSeries';

class TreeExplorer extends Component {

    constructor() {
        super();
        this.state = {
            rootChord: [0, 4, 7],
        };
    }

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
            <TrichordTree
                rationalizer={extendRationalizer(this.props.acousticRatios)}
                rootChord={this.state.rootChord}
                onClickChord={rootChord => this.setState({ rootChord })}
                //
                viewOptions={this.props.treeViewOptions}
                {...this.props.viewOptionsHandlers}
            />
            {this.props.rootsVisible &&
                <RationalizerConfig
                    values={this.props.acousticRatios}
                    onChangeValue={(newValue, index) =>
                        this.props.onSetAcousticRatio(index, newValue)}
                />}
        </Page>;
    }

}

function mapStateToProps(state) {
    return {
        acousticRatios: state.acousticRatios,
        rootsVisible: state.treeViewOptions.showRoots,
        treeViewOptions: state.treeViewOptions,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onSetAcousticRatio: (index, ratio) => dispatch(
            Actions.setAcousticRatio(index, ratio)),
        viewOptionsHandlers: {
            onSetLevels: levels => dispatch(Actions.setTreeLevels(levels)),
            onSetShowRoots: showRoots => dispatch(
                Actions.setTreeShowRoots(showRoots)),
            onSetShowOctaves: showOctaves => dispatch(
                Actions.setTreeShowOctaves(showOctaves)),
            onSetWide: wide => dispatch(Actions.setTreeWide(wide)),
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeExplorer);
