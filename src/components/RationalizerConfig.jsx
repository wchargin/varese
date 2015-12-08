import React, {Component, PropTypes} from 'react';

import {canonicalRationalizer} from '../HarmonicSeries';
import Rational from '../Rational';

export default class RationalizerConfig extends Component {
    constructor() {
        super();
        const initialInputs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        this.state = {
            values: initialInputs.map(canonicalRationalizer),
        };
    }

    render() {
        const names = [
            "m2", "M2", "m3", "M3",
            "P4", "A4/d5", "P5",
            "m6", "M6", "m7", "M7"
        ];
        return <div>
            {this.state.values.map((value, index) => {
                const setValueTo = newValue => {
                    const {values} = this.state;
                    this.setState({
                        values: [
                        ...values.slice(0, index),
                        newValue,
                        ...values.slice(index + 1),
                        ],
                    });
                };
                const canonicalValue = canonicalRationalizer(index + 1);
                return <AcousticRatioBox
                    value={value}
                    key={index}
                    name={names[index]}
                    onChange={newValue => setValueTo(newValue)}
                    onReset={newValue => setValueTo(canonicalValue)}
                />;
            })}
            {this._renderDescendingWarning(this.state.values, names)}
        </div>;
    }

    _renderDescendingWarning(values, names) {
        const bad = values
            .slice(0, values.length - 1)
            .map((x, i) => i)
            .filter(i => values[i].toNumber() <= values[i + 1].toNumber())
            .map(i => `${names[i]}\u2013${names[i + 1]}`);
        if (!bad.length) {
            return null;
        }

        const prefix = bad.length === 1 ? "the interval" : "the intervals";
        const list = bad.length === 1 ? bad[0] :
            bad.length === 2 ? `${bad[0]} and ${bad[1]}` :
            (bad.slice(0, bad.length - 1).join(", ") + ", and " +
                bad[bad.length - 1]);
        const verb = bad.length === 1 ? "is" : "are";
        return <div className="alert alert-warning">
            <strong>Warning:</strong> {prefix} {list} {verb} not descending.
        </div>;
    }
}

class AcousticRatioBox extends Component {

    render() {
        return <div style={{
            display: "inline-flex",
            width: 60,
            flexDirection: "column",
            textAlign: "center",
            marginRight: 5,
        }}>
            <strong>{this.props.name}</strong>
            <AcousticRatioEntry
                value={this.props.value}
                onChange={this.props.onChange}
            />
            <button onClick={this.props.onReset}>Reset</button>
        </div>;
    }

}
AcousticRatioBox.propTypes = {
    value: PropTypes.instanceOf(Rational),
    onChange: PropTypes.func.isRequired,

    onReset: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
};

/*
 * State field 'text' represents the text being entered right now;
 * it should be null when the user is not entering text
 * (e.g., the field is blurred, or the user hasn't typed anything yet).
 * If the 'text' state field is present,
 * it will be used for the value of the input node.
 *
 * (This is so that if you type something like "2:4"
 * it will only be corrected to "1:2" after you exit the box,
 * so you can actually type something like "2:41.")
 */
class AcousticRatioEntry extends Component {

    constructor() {
        super();
        this.state = {
            text: null,
        };
    }

    render() {
        const text = this.state.text !== null ?
            this.state.text :
            `${this.props.value.a}:${this.props.value.b}`;
        return <input
            ref="input"
            value={text}
            onChange={() => this._handleChange()}
            onBlur={() => this.setState({ text: null })}
            onClick={() => this.refs.input.select()}
            style={{ width: "100%", textAlign: "center" }}
        />;
    }

    _fromString(str) {
        const match = str.match(/^\s*(\d+)\s*:\s*(\d+)\s*$/);
        if (!match) {
            return { status: "error", error: "no match" };
        } else {
            const {1: a, 2: b} = match;
            try {
                return {
                    status: "success",
                    result: new Rational(parseInt(a, 10), parseInt(b, 10)),
                };
            } catch (e) {
                return { status: "error", error: e.message };
            }
        }
    }

    _handleChange() {
        const text = this.refs.input.value;
        this.setState({ text });

        const value = this._fromString(text);
        if (value.result) {
            this.props.onChange(value.result);
        }
    }

}
AcousticRatioEntry.propTypes = {
    value: PropTypes.instanceOf(Rational),
    onChange: PropTypes.func.isRequired,
};
