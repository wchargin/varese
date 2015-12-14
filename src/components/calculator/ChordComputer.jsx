import React, {Component, PropTypes} from 'react';

import PitchNames from '../../PitchNames';
import {findChordRootOffset} from '../../HarmonicSeries';

import ChordInput from '../ChordInput';

const DEFAULT_CHORD = [3, 7, 10];

export default class ChordComputer extends Component {

    constructor() {
        super();
        this.state = {
            chord: DEFAULT_CHORD,
        };
    }

    render() {
        const example = (text, quote = true) =>
            <span>
                {quote && "\u201C" /* &ldquo; */}
                <code style={{
                    color: "black",
                    fontFamily: "monospace",
                }}>{text}</code>
                {quote && "\u201D" /* &rdquo; */}
            </span>;

        return <div>
            <p>
            Enter a chord like
            </p>
            <ul>
                <li>
                    {example("C4 E4 G4")}
                    {" "}
                    (using scientific pitch notation);
                </li>
                <li>
                    {example("B#3 Fb4 G4")}
                    {" "}
                    (using {example("#", false)} for sharps
                     and {example("b", false)} and flats);
                </li>
                <li>
                    {example("G, C E''")}
                    {" "}
                    (using relative pitch notation,
                    where {example(",", false)} lowers a pitch by an octave
                    and {example("'", false)} raises a pitch by an octave); or
                </li>
                <li>
                    {example("0 4 7")}{" "}
                    (indicating semitones above middle&nbsp;C).
                </li>
            </ul>
            <ChordInput
                value={this.state.chord}
                message="Enter a chord: "
                onChange={chord => this.setState({ chord })}
            />
            <ChordOutput
                chord={this.state.chord}
                rationalizer={this.props.rationalizer}
            />
        </div>;
    }

}
ChordComputer.propTypes = {
    rationalizer: PropTypes.func.isRequired,
};

class ChordOutput extends Component {
    render() {
        const {rationalizer, chord} = this.props;
        if (chord.length < 1) {
            return <div className="alert alert-info">
                There&rsquo;s no chord there to analyze.
            </div>;
        } else {
            const maybeOffset = findChordRootOffset(rationalizer, chord);
            if (maybeOffset.status === "success") {
                const offset = maybeOffset.result;
                const noun = offset === 1 ? "semitone" : "semitones";
                const str = offset.toString().replace(/-/g, "\u2212");
                const note = PitchNames.pitchToName(offset, true);
                return <div className="alert alert-info">
                    The root of that chord is <strong>{note}</strong>,
                    at {str} {noun}.
                </div>;
            } else {
                const e = maybeOffset.error;
                if (e === "infinite") {
                    return <div className="alert alert-danger">
                        <strong>Whoops!</strong>
                        {" "}
                        That chord's too complicated for me to analyze.
                        In particular, the acoustic ratios are
                        such complicated fractions that
                        your browser gives up on the math.
                        Try another one?
                    </div>;
                } else if (e === "zero_ratio") {
                    return <div className="alert alert-danger">
                        <strong>Whoops!</strong>
                        {" "}
                        It looks like one of the acoustic ratios
                        involved in this chord
                        turns out to be zero.
                        That can't be!
                        Check your rationalization configuration and try again.
                    </div>;
                } else {
                    throw e;
                }
            }
        }
    }
}
ChordOutput.propTypes = {
    rationalizer: PropTypes.func.isRequired,
    chord: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
};
