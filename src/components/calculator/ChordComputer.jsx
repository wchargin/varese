import React, {Component} from 'react';

import PitchNames from '../../PitchNames';
import {findChordRootOffset} from '../../HarmonicSeries';

import ChordInput from '../ChordInput';

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

class ChordOutput extends Component {
    render() {
        const {rationalizer, chord} = this.props;
        if (chord.length < 1) {
            return <span>There&rsquo;s no chord there to analyze.</span>;
        } else {
            const maybeOffset = findChordRootOffset(rationalizer, chord);
            if (maybeOffset.status === "success") {
                const offset = maybeOffset.result;
                const noun = offset === 1 ? "semitone" : "semitones";
                const str = offset.toString().replace(/-/g, "\u2212");
                const note = PitchNames.pitchToName(offset, true);
                return <span>
                    The root of that chord is <strong>{note}</strong>,
                    at {str} {noun}.
                </span>;
            } else {
                const e = maybeOffset.error;
                if (e && e.match(/finite/)) {
                    return <span>
                        Sorry, that chord's too complicated for me to analyze.
                        In particular, the acoustic ratios are
                        such complicated fractions that
                        your browser gives up on the math.
                        Try another one?
                    </span>;
                } else {
                    throw e;
                }
            }
        }
    }
}
