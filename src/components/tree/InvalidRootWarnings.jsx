/*
 * Given a list of chords that will appear in a tree,
 * this component tries to find all of their roots, and notes any failures.
 * It generates warning messages about each failure in human-readable form.
 */
import React, {Component, PropTypes} from 'react';

import {findChordRootOffset} from '../../core/HarmonicSeries';

export default class InvalidRootWarnings extends Component {

    render() {
        const errors = this.props.chords.map(chord => {
            const result = findChordRootOffset(this.props.rationalizer, chord);
            return result.status === "error" ? result.error : null;
        }).filter(x => x !== null);

        const finiteError = errors.some(x => x.match(/finite/)) &&
            <Warning key="finite">
                <strong>Note:</strong>
                {" "}
                Some of these chords are too complicated to analyze,
                so we can't find their roots.
                In particular, the acoustic ratios are
                such complicated fractions that
                your browser gives up on the math.
                These chords are indicated with a question mark
                in the place where the root should be.
            </Warning>;

        const zeroRatioError = errors.some(x => x.match(/zero_ratio/)) &&
            <Warning key="zero-ratio">
                <strong>Note:</strong>
                {" "}
                Some of these chords involve a semitone difference
                that you've mapped to an acoustic ratio of zero,
                so we can't find their roots.
                Check your rationalization configuration to fix this.
                In the meantime,
                these chords are indicated with a question mark
                in the place where the root should be.
            </Warning>;

        return <div>
            {finiteError}
            {zeroRatioError}
        </div>;
    }

}
InvalidRootWarnings.propTypes = {
    chords: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.number.isRequired).isRequired).isRequired,
    rationalizer: PropTypes.func.isRequired,
};

class Warning extends Component {
    render() {
        return <div
            className="alert alert-warning"
            style={{ marginTop: 20 }}
            {...this.props}
        >
            {this.props.children}
        </div>;
    }
}
Warning.propTypes = {
    children: PropTypes.node.isRequired,
};
