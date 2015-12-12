import React, {Component, PropTypes} from 'react';

import {findChordRootOffset} from '../../HarmonicSeries';

import Folding from '../../Folding';
import {flatten} from '../../Utils';

import TreeView from './TreeView';
import TrichordView from './TrichordView';
import ActionBar from './ActionBar';

export default class TrichordTree extends Component {

    render() {
        const {rationalizer, rootChord, onClickChord} = this.props;
        const {levels} = this.props.viewOptions;
        const size = levels <= 4 ? 3 :
            levels <= 5 ? 2 :
            1;

        const chords = this._generateTree(rootChord, levels);
        const nodes = chords.map(row => row.map(chord =>
            <TrichordView
                rationalizer={rationalizer}
                notes={chord}
                onClick={() => onClickChord(chord)}
                size={size}
                showRoot={this.props.viewOptions.showRoots}
                showOctave={this.props.viewOptions.showOctaves}
                limits={this.props.viewOptions.limits}
            />));

        // We'd like to add some padding when it's wide
        // so it's not flush against the edge.
        // We could just use 'paddingLeft' and 'paddingRight',
        // but doing it this way---by modifying the width and position---
        // has the nice side-effect
        // that it prevents a horizontal scrollbar from appearing
        // (it can otherwise appear when there's a vertical scrollbar,
        // because the "viewport width" includes the vertical scrollbar
        // for some reason).
        const widePadding = 20;
        const wideStyle = this.props.viewOptions.wide ? {
            position: "relative",
            width: `calc(100vw - ${2 * widePadding}px)`,
            left: `calc(-50vw + ${widePadding}px + 50%)`,
        } : {};

        return <div>
            {this._renderWarnings(chords, rationalizer)}
            <ActionBar
                rootChord={rootChord}
                onSetChord={onClickChord}
            />
            <div style={{...wideStyle, marginBottom: 20}}>
                <TreeView
                    elements={nodes}
                    spacing={2 * size}
                />
            </div>
        </div>;
    }
    _iterateRow(previousRow) {
        const branch = c => [Folding.outfoldDown(c), Folding.outfoldUp(c)];
        const branches = previousRow.map(branch);
        return flatten(branches);
    }
    _generateTree(root, depth) {
        const result = [[root]];
        for (let i = 1; i < depth; i++) {
            result.push(this._iterateRow(result[result.length - 1]));
        }
        return result;
    }

    /*
     * Try to find the roots of all the chords that will appear in the tree.
     * Return a list of warnings that explain why any may have failed.
     */
    _renderWarnings(chords, rationalizer) {
        if (!this.props.viewOptions.showRoots) {
            return [];
        }

        const Warning = props =>
            <div
                className="alert alert-warning"
                style={{ marginTop: 20 }}
                {...props}
            >{props.children}</div>;

        const errors = chords.map(row => row.map(chord => {
            const result = findChordRootOffset(rationalizer, chord);
            return result.status === "error" ? result.error : null;
        }));
        const flattenedErrors = flatten(errors);
        const errorTypes = {
            finite: flattenedErrors.some(x => x && x.match(/finite/)),
            zeroRatio: flattenedErrors.some(x => x && x.match(/zero_ratio/)),
        };

        return [
            errorTypes.finite &&
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
                </Warning>,
            errorTypes.zeroRatio &&
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
                </Warning>,
        ];
    }

}
TrichordTree.propTypes = {
    rationalizer: PropTypes.func.isRequired,
    rootChord: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    onClickChord: PropTypes.func.isRequired,

    viewOptions: PropTypes.shape({
        levels: PropTypes.number.isRequired,
        showRoots: PropTypes.bool.isRequired,
        showOctaves: PropTypes.bool.isRequired,
        wide: PropTypes.bool.isRequired,
        limits: PropTypes.shape({
            minCombined: PropTypes.number.isRequired,
            maxCombined: PropTypes.number.isRequired,
            minIndividual: PropTypes.number.isRequired,
            maxIndividual: PropTypes.number.isRequired,
            minCombinedEnabled: PropTypes.bool.isRequired,
            maxCombinedEnabled: PropTypes.bool.isRequired,
            minIndividualEnabled: PropTypes.bool.isRequired,
            maxIndividualEnabled: PropTypes.bool.isRequired,
        }).isRequired,
    }).isRequired,
};
