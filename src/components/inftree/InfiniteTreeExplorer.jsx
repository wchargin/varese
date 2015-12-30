import React, {Component} from 'react';
import {connect} from 'react-redux';

import {extendRationalizer} from '../../core/HarmonicSeries';

import {mapStateToProps, mapDispatchToProps} from '../TreeReduxBindings';
import Page from '../Page';
import InfiniteTrichordTree from './InfiniteTrichordTree';
import RationalizerSettings from '../settings/RationalizerSettings';
import ViewOptions from '../settings/ViewOptions';

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

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(InfiniteTreeExplorer);
