import React, {Component} from 'react';

import {findChordRootOffset} from '../HarmonicSeries';

const DEFAULT_CHORD = [0, 4, 7];

export default class ChordComputer extends Component {

    constructor() {
        super();
        this.state = {
            chord: DEFAULT_CHORD,
        }
    }

    render() {
        return <div>
            <p>
            Enter pitches as comma-separated semitone values above middle C.
            For example, the input <tt>0, 4, 7</tt> corresponds to
            the middle C&nbsp;major triad.
            </p>
            <ChordInput
                value={this.state.chord}
                onChange={chord => this.setState({ chord })}
            />
            <ChordOutput
                chord={this.state.chord}
                rationalizer={this.props.rationalizer}
            />
        </div>;
    }

}

class ChordInput extends Component {

    constructor() {
        super();
        this.state = {
            text: null,
        };
    }

    componentDidMount() {
        this.refs.input.focus();
        this.refs.input.select();
    }

    render() {
        const text = this.state.text !== null ?
            this.state.text :
            this._toString(this.props.value);
        return <div className="well">
            <strong>Enter a chord:</strong>
            {" "}
            <input
                ref="input"
                value={text}
                onChange={() => this._handleChange()}
                onBlur={() => this.setState({ text: null })}
                style={{
                    color: this._fromString(text).status === "error" ? "red" : undefined,
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
        return value.join(", ");
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
        if (!trimmed.match(/^-?\d+(?:,-?\d+)*$/)) {
            return { status: "error", error: "no match" };
        }
        return {
            status: "success",
            result: trimmed.split(",").map(x => parseInt(x, 10)),
        };
    }
}

class ChordOutput extends Component {
    render() {
        const {rationalizer, chord} = this.props;
        if (chord.length < 1) {
            return <span>There&rsquo;s no chord there to analyze.</span>;
        } else {
            const offset = findChordRootOffset(rationalizer, chord);
            const noun = offset === 1 ? "semitone" : "semitones";
            const str = offset.toString().replace(/-/g, "\u2212");
            return <span>The root of that chord is at {str} {noun}.</span>;
        }
    }
}
