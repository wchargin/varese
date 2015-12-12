import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as Actions from '../../Actions';

import Page from './../Page';
import ChordComputer from './ChordComputer';
import RationalizerConfig from '../RationalizerConfig';

import {extendRationalizer} from '../../HarmonicSeries';

class PitchCalculator extends Component {

    render() {
        return <Page path="calculator">
            <h1>Pitch space root calculator</h1>
            <ChordComputer
                rationalizer={extendRationalizer(this.props.acousticRatios)}
            />
            <RationalizerConfig
                values={this.props.acousticRatios}
                onChangeValue={(newValue, index) =>
                    this.props.onSetAcousticRatio(index, newValue)}
            />
        </Page>;
    }
}

function mapStateToProps(state) {
    return {
        acousticRatios: state.acousticRatios,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onSetAcousticRatio: (index, ratio) => dispatch(
            Actions.setAcousticRatio(index, ratio)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PitchCalculator);
