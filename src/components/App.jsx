import React, {Component} from 'react';

import RationalizerConfig from './RationalizerConfig';

import {canonicalRationalizer} from '../HarmonicSeries';
const initialInputs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const initialValues = initialInputs.map(canonicalRationalizer);
const names = [
    "m2", "M2", "m3", "M3",
    "P4", "A4/d5", "P5",
    "m6", "M6", "m7", "M7"
];

export default class App extends Component {
    constructor() {
        super();
        this.state = {
            values: initialValues,
        };
    }

    render() {
        return <div className="container">
            <h1>Var&egrave;se pitch calculator</h1>
            <RationalizerConfig
                values={this.state.values}
                defaults={initialValues}
                names={names}
                onChangeValue={(newValue, index) => {
                    const {values} = this.state;
                    this.setState({
                        values: [
                            ...values.slice(0, index),
                            newValue,
                            ...values.slice(index + 1),
                        ],
                    });
                }}
            />
        </div>;
    }
}
