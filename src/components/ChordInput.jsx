import React, {Component, PropTypes} from 'react';

import PitchNames from '../core/PitchNames';
import TextUtils from '../utils/TextUtils';

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
        const formattedText = text.replace(/\s/g, "\u2002");  // EN SPACE

        return <div className="well">
            <label htmlFor="chord-entry">{this.props.message}</label>
            {" "}
            <input
                className="form-control"
                ref="input"
                id="chord-entry"
                value={formattedText}
                onChange={() => this._handleChange()}
                onBlur={() => this.setState({ text: null, error: null })}
                style={{
                    color: this._fromString(text).status === "error" ?
                        "red" :
                        undefined,
                    display: "inline-block",
                    width: "unset",
                }}
                spellCheck={false}
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
        return value.map(x => PitchNames.pitchToName(x, true)).join(" ");
    }

    _fromString(str) {
        const trimmed = str.trim().replace(/\s+/g, " ");

        const parts = trimmed.length === 0 ? [] : trimmed.split(" ");
        const maybeParsedParts = parts.map(text => ({
            input: text,
            output: PitchNames.parseNameOrPitch(text),
        }));

        const badParts = maybeParsedParts.filter(x => x.output === null);
        if (badParts.length !== 0) {
            const bad = badParts.map(x => `"${x.input}"`);

            const noun1 = TextUtils.ngettext(bad, "token", "tokens");
            const verb = TextUtils.ngettext(bad, "doesn't", "don't");
            const noun2 = TextUtils.ngettext(
                bad, "a valid note", "valid notes");
            const list = TextUtils.list(bad);

            return {
                status: "error",
                error: `The ${noun1} ${list} ${verb} look like ${noun2}.`,
            };
        }

        const good = maybeParsedParts.map(x => x.output).sort((a, b) => a - b);

        const {exactly} = this.props;
        if (exactly !== undefined && good.length !== exactly) {
            const actual = good.length;
            const nounActual = TextUtils.quantity(actual, "note", "notes");
            const nounExactly = TextUtils.quantity(exactly, "note", "notes");
            const error =
                `It looks like you entered ${nounActual}, ` +
                `but I was expecting exactly ${nounExactly}.`;
            return {
                status: "error",
                error,
            };
        }
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

    exactly: PropTypes.number,
};
