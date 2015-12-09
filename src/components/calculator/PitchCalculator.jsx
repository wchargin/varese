import React, {Component} from 'react';

import Page from './../Page';
import ChordComputer from './ChordComputer';
import RationalizerConfig from './RationalizerConfig';

import {extendRationalizer, canonicalRationalizer} from '../../HarmonicSeries';
import Rational from '../../Rational';

const LOCAL_STORE_KEY = "rationalizer_values";
const initialInputs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const initialValues = initialInputs.map(canonicalRationalizer);
const names = [
    "m2", "M2", "m3", "M3",
    "P4", "A4/d5", "P5",
    "m6", "M6", "m7", "M7"
];

/*
 * Given an array of JSON blobs that were serialized from Rationals,
 * reconstruct the Rationals.
 *
 * Rehydrating things that are already rational is a no-op.
 */
function rehydrate(arr) {
    return arr.map(x => new Rational(x.a, x.b));
}

export default class PitchCalculator extends Component {

    constructor() {
        super();
        this.state = {
            values: rehydrate(LocalStore.get(LOCAL_STORE_KEY, initialValues)),
        };
    }

    render() {
        return <Page path="calculator">
            <h1>Var&egrave;se pitch calculator</h1>
            <ChordComputer
                rationalizer={extendRationalizer(this.state.values)}
            />
            <RationalizerConfig
                values={this.state.values}
                defaults={initialValues}
                names={names}
                onChangeValue={(newValue, index) => {
                    const {values} = this.state;
                    const newValues = [
                        ...values.slice(0, index),
                        newValue,
                        ...values.slice(index + 1),
                    ];
                    this.setState({ values: newValues });
                    LocalStore.set(LOCAL_STORE_KEY, newValues);
                }}
            />
        </Page>;
    }
}
