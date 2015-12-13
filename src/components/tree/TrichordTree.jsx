/*
 * Given a root chord and some view parameters,
 * render an interactive chord tree.
 * This involves computing the chords to be rendered
 * (the number of levels is provided as a view option)
 * and rendering them all as individual TrichordViews.
 */
import React, {Component, PropTypes} from 'react';

import Folding from '../../Folding';
import {flatten} from '../../Utils';

import TreeView from './TreeView';
import TrichordView from './TrichordView';
import InvalidRootWarnings from './InvalidRootWarnings';

export default class TrichordTree extends Component {

    render() {
        const {rationalizer, rootChord, onClickChord} = this.props;
        const {levels} = this.props.viewOptions;

        const [sizeSmall, sizeMedium, sizeLarge] = [1, 2, 3];
        const size =
            levels <= 4 ? sizeLarge :
            levels <= 5 ? sizeMedium :
                          sizeSmall;

        const chords = this._generateTree(rootChord, levels);
        const nodes = chords.map((row, rowIndex) => row.map(chord => {
            // The root note has some special properties:
            // for example, it's the only editable node,
            // and it should also always be at full size.
            // Detecting it is made easy by the fact that
            // it's also the only node in the first row.
            const isRoot = rowIndex === 0;
            return <TrichordView
                rationalizer={rationalizer}
                notes={chord}
                //
                limits={this.props.viewOptions.limits}
                showOctave={this.props.viewOptions.showOctaves}
                showRoot={this.props.viewOptions.showRoots}
                size={isRoot ? sizeLarge : size}
                //
                onClick={isRoot ? null : (() => onClickChord(chord))}
                onChange={isRoot ? (chord => onClickChord(chord)) : null}
            />;
        }));

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
            <InvalidRootWarnings
                chords={flatten(chords)}
                rationalizer={rationalizer}
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
