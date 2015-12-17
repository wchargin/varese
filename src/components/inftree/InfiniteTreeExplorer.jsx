import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as Actions from '../../Actions';

import Page from '../Page';

import InfiniteCanvas from './InfiniteCanvas';
import ViewOptions from '../tree/ViewOptions';

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
            <h1>Infinite chord tree explorer (alpha)</h1>
            <ViewOptions
                {...this.props.treeViewOptions}
                {...this.props.viewOptionsHandlers}
            />
            <InfiniteCanvas
                levels={this.props.treeViewOptions.levels}
            />
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
            onSetShowRoots: showRoots => dispatch(
                Actions.setTreeShowRoots(showRoots)),
            onSetShowOctaves: showOctaves => dispatch(
                Actions.setTreeShowOctaves(showOctaves)),
            onSetWide: wide => dispatch(Actions.setTreeWide(wide)),
            onSetLimitValue: (limit, value) => dispatch(
                Actions.setTreeLimitValue(limit, value)),
            onSetLimitEnabled: (limit, enabled) => dispatch(
                Actions.setTreeLimitEnabled(limit, enabled)),
        },
    };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(InfiniteTreeExplorer);
