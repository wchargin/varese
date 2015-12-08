import React, {Component} from 'react';

import PitchNames from '../PitchNames';
import {findChordRootOffset} from '../HarmonicSeries';

const DEFAULT_CHORD = [3, 7, 10];

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
            Enter a chord as comma-separated notes,
            either in scientific pitch notation (like <tt>C#5</tt>)
            or in a number of semitones above middle&nbsp;C (like <tt>13</tt>).
            For example, the input <tt>0, 4, 7</tt> corresponds to
            the middle C&nbsp;major triad,
            as does <tt>C4, E4, G4</tt>.
            You can use <tt>b</tt> and <tt>#</tt> for flats and sharps,
            like <tt>Eb4</tt> or <tt>D###7</tt>.
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
            <strong>Enter a chord:</strong>
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

class ChordOutput extends Component {
    render() {
        const {rationalizer, chord} = this.props;
        if (chord.length < 1) {
            return <span>There&rsquo;s no chord there to analyze.</span>;
        } else {
            const offset = findChordRootOffset(rationalizer, chord);
            const noun = offset === 1 ? "semitone" : "semitones";
            const str = offset.toString().replace(/-/g, "\u2212");
            const note = PitchNames.pitchToName(offset, true);
            return <span>
                The root of that chord is <strong>{note}</strong>,
                at {str} {noun}.
            </span>;
        }
    }
}
