import React, {Component, PropTypes} from 'react';

import PitchNames from '../PitchNames';

export default class ChordInput extends Component {

    constructor() {
        super();
        this.state = {
            text: null,
            error: null,
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
                onBlur={() => this.setState({ text: null, error: null })}
                style={{
                    color: this._fromString(text).status === "error" ?
                        "red" :
                        undefined,
                    display: "inline-block",
                    width: "unset",
                }}
            />
            <span style={{
                marginLeft: 10,
            }}>{this.state.error}</span>
        </div>;
    }

    _handleChange() {
        const text = this.refs.input.value;
        this.setState({ text });

        const value = this._fromString(text);
        if (value.status === "success") {
            this.props.onChange(value.result);
            this.setState({ error: null });
        } else {
            this.setState({ error: value.error });
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

        const parts = trimmed.split(",");
        const maybeParsedParts = parts.map(text => ({
            input: text,
            output: PitchNames.parseNameOrPitch(text),
        }));

        const badParts = maybeParsedParts.filter(x => x.output === null);
        if (badParts.length !== 0) {
            const bad = badParts.map(x => `"${x.input}"`);
            const singular = bad.length === 1;

            const noun1 = singular ? "token" : "tokens";
            const verb = singular ? "doesn't" : "don't";
            const noun2 = singular ? "a valid note" : "valid notes";
            const list = bad.length === 1 ? bad[0] :
                bad.length === 2 ? `${bad[0]} and ${bad[1]}` :
                (bad.slice(0, bad.length - 1).join(", ") + ", and " +
                    bad[bad.length - 1]);

            return {
                status: "error",
                error: `The ${noun1} ${list} ${verb} look like ${noun2}.`,
            };
        }

        const good = maybeParsedParts.map(x => x.output).sort((a, b) => a - b);
        return {
            status: "success",
            result: good,
        };
    }
}
ChordInput.propTypes = {
    value: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    onChange: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
}
