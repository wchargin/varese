import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as Actions from '../../Actions';

import Page from './../Page';
import ChordComputer from './ChordComputer';
import RationalizerConfig from './RationalizerConfig';

import {extendRationalizer, canonicalRationalizer} from '../../HarmonicSeries';

// TODO(william): Centralize these somewhere. Maybe a HarmonicData module?
const initialInputs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const initialValues = initialInputs.map(canonicalRationalizer);
const names = [
    "m2", "M2", "m3", "M3",
    "P4", "A4/d5", "P5",
    "m6", "M6", "m7", "M7"
];

class PitchCalculator extends Component {

    render() {
        return <Page path="calculator">
            <h1>Pitch space root calculator</h1>
            <ChordComputer
                rationalizer={extendRationalizer(this.props.acousticRatios)}
            />
            <RationalizerConfig
                values={this.props.acousticRatios}
                defaults={initialValues}
                names={names}
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
