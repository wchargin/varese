import React, {Component, PropTypes} from 'react';

import PitchNames from '../PitchNames';

export default class ChordInput extends Component {

    constructor() {
        super();
        this.state = {
            text: null,
        };
    }

    componentDidMount() {
        const {input} = this.refs;
        input.focus();
        input.selectionStart = input.value.length;
        input.selectionEnd = input.value.length;
    }

    render() {
        const text = this.state.text !== null ?
            this.state.text :
            this._toString(this.props.value);
        return <div className="well">
            <strong>{this.props.message}</strong>
            {" "}
            <input
                className="form-control"
                ref="input"
                value={text}
                onChange={() => this._handleChange()}
                onBlur={() => this.setState({ text: null })}
                style={{
                    color: this._fromString(text).status === "error" ?
                        "red" :
                        undefined,
                    display: "inline-block",
                    width: "unset",
                }}
            />
        </div>;
    }

    _handleChange() {
        const text = this.refs.input.value;
        this.setState({ text });

        const value = this._fromString(text);
        if (value.result) {
            this.props.onChange(value.result);
        }
    }

    _toString(value) {
        return value.map(x => PitchNames.pitchToName(x, true)).join(", ");
    }

    _fromString(str) {
        const trimmed = str
            .replace(/\s/g, "")     // internal spaces
            .replace(/^,*/, "")     // leading commas
            .replace(/,,+/g, ",")   // internal commas
            .replace(/,+$/, "");    // trailing commas
        if (trimmed.length === 0) {
            return { status: "success", result: [] };
        }

        const parts = trimmed.split(",").map(PitchNames.parseNameOrPitch);
        if (parts.filter(x => x === null).length !== 0) {
            return { status: "error", error: "some parts of parse failed" };
        }
        parts.sort((a, b) => a - b);

        return {
            status: "success",
            result: parts,
        };
    }
}
ChordInput.propTypes = {
    value: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    onChange: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
}
