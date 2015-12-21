import React, {Component, PropTypes} from 'react';

import {canonicalValues, intervalNames} from '../../core/HarmonicData';
import Rational from '../../core/Rational';
import TextUtils from '../../utils/TextUtils';

export default class RationalizerSettings extends Component {

    render() {
        const {values} = this.props;
        return <div style={{ marginBottom: 20 }}>
            <h3>Configure rationalization</h3>
            <p>
            How do you want to map semitone differences to acoustic ratios?
            You can modify the default mappings by changing the cells below.
            </p>
            <p>
            For best results, these values should be strictly decreasing,
            and all between 1.0 (which would be a&nbsp;P0)
            and 0.5 (which would be a&nbsp;P8).
            </p>
            <div style={{
                padding: "10px 0",
                display: "table-row",
                verticalAlign: "top",
            }}>
                {values.map((value, index) => {
                    const setValueTo = v => this.props.onChangeValue(index, v);
                    return <AcousticRatioBox
                        value={value}
                        key={index}
                        name={intervalNames[index]}
                        isDefault={value.equals(canonicalValues[index])}
                        onChange={newValue => setValueTo(newValue)}
                        onReset={() => setValueTo(canonicalValues[index])}
                    />;
                })}
            </div>
            {this._renderDescendingWarning(values)}
            {this._renderZeroWarning(values)}
        </div>;
    }

    _renderDescendingWarning(values) {
        const bad = values
            .slice(0, values.length - 1)
            .map((x, i) => i)
            .filter(i => values[i].toNumber() <= values[i + 1].toNumber())
            .map(i => `${intervalNames[i]}\u2013${intervalNames[i + 1]}`);
        if (!bad.length) {
            return null;
        }

        const prefix = TextUtils.ngettext(bad,
            "The interval", "The intervals");
        const list = TextUtils.list(bad);
        const verb = TextUtils.ngettext(bad, "is", "are");
        return <div className="alert alert-warning" style={{marginTop: 15}}>
            <strong>Warning:</strong> {prefix} {list} {verb} not descending.
        </div>;
    }

    _renderZeroWarning(values) {
        const bad = values
            .map((x, i) => i)
            .filter(i => values[i].toNumber() === 0)
            .map(i => intervalNames[i]);
        if (!bad.length) {
            return null;
        }

        const noun1 = TextUtils.ngettext(bad, "ratio", "ratios");
        const list = TextUtils.list(bad);
        const verb = TextUtils.ngettext(bad, "is", "are");
        const noun2 = TextUtils.ngettext(bad,
            "this interval",
            "one of these intervals");
        return <div className="alert alert-warning" style={{marginTop: 15}}>
            <strong>Warning:</strong>
            {" "}
            It looks like the {noun1} for {list} {verb} zero.
            This is not good; if {noun2} ever appears in a chord,
            the chord will be impossible to analyze.
            You should fix that.
        </div>;
    }
}
RationalizerSettings.propTypes = {
    values: PropTypes.arrayOf(
        PropTypes.instanceOf(Rational).isRequired).isRequired,
    onChangeValue: PropTypes.func.isRequired,
};

class AcousticRatioBox extends Component {

    render() {
        const id = "ratio-entry-" + this.props.name;
        return <div style={{
            display: "table-cell",
            width: 60,
            textAlign: "center",
            padding: "0 2px",
        }}>
            <label htmlFor={id}>{this.props.name}</label><br />
            <AcousticRatioEntry
                value={this.props.value}
                onChange={this.props.onChange}
                id={id}
            />
            {!this.props.isDefault &&
                <button onClick={this.props.onReset}>Reset</button>}
        </div>;
    }

}
AcousticRatioBox.propTypes = {
    value: PropTypes.instanceOf(Rational),
    onChange: PropTypes.func.isRequired,

    onReset: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    isDefault: PropTypes.bool.isRequired,
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
            id={this.props.id}
            className="form-control"
            value={text}
            onChange={() => this._handleChange()}
            onBlur={() => this.setState({ text: null })}
            onClick={() => this.refs.input.select()}
            style={{
                width: "100%",
                textAlign: "center",
                padding: 1,
            }}
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
    id: PropTypes.string.isRequired,
};
