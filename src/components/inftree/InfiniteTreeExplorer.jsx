import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as Actions from '../../Actions';

import Page from '../Page';

import InfiniteTrichordTree from './InfiniteTrichordTree';
import RationalizerSettings from '../settings/RationalizerSettings';
import ViewOptions from '../settings/ViewOptions';

import {extendRationalizer} from '../../HarmonicSeries';

class InfiniteTreeExplorer extends Component {

    constructor() {
        super();
        this.state = {
            rootChord: [0, 4, 7],
        };
    }

    /* eslint-disable react/prop-types */
    render() {
        return <Page path="infinite-tree">
            <h1>
                Infinite chord tree explorer
                {" "}
                <span style={{ color: "red", fontSize: "75%" }}>
                    {"beta".toUpperCase()}
                </span>
            </h1>
            <ViewOptions
                infinite={true}
                values={this.props.treeViewOptions}
                handlers={this.props.viewOptionsHandlers}
            />
            <InfiniteTrichordTree
                rationalizer={extendRationalizer(this.props.acousticRatios)}
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
            onSetInfiniteLevels: levels => dispatch(
                Actions.setInfiniteTreeLevels(levels)),
            onSetInfiniteHeight: height => dispatch(
                Actions.setInfiniteTreeHeight(height)),
            onSetShowRoots: showRoots => dispatch(
                Actions.setTreeShowRoots(showRoots)),
            onSetShowOctaves: showOctaves => dispatch(
                Actions.setTreeShowOctaves(showOctaves)),
            onSetWide: wide => dispatch(Actions.setTreeWide(wide)),
            onSetTreeNumber: treeNumber => dispatch(
                Actions.setTreeTreeNumber(treeNumber)),
            onSetRootBass: rootBass => dispatch(
                Actions.setTreeRootBass(rootBass)),
            onSetLimitValue: (limit, value) => dispatch(
                Actions.setTreeLimitValue(limit, value)),
            onSetLimitEnabled: (limit, enabled) => dispatch(
                Actions.setTreeLimitEnabled(limit, enabled)),
        },
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(InfiniteTreeExplorer);
