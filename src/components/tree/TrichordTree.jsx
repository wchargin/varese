import React, {Component, PropTypes} from 'react';

import Folding from '../../Folding';
import TreeView from './TreeView';
import TrichordView from './TrichordView';

export default class TrichordTree extends Component {
    render() {
        const {rootChord, levels} = this.props;
        const chords = this._generateTree(rootChord, levels);
        const nodes = chords.map(row =>
            row.map(chord => <TrichordView notes={chord} />));
        return <TreeView elements={nodes} />;
    }
    _iterateRow(previousRow) {
        const branch = c => [Folding.outfoldDown(c), Folding.outfoldUp(c)];
        const branches = previousRow.map(branch);
        const flattened = [].concat.apply([], branches);
        return flattened;
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
    rootChord: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    levels: PropTypes.number,
};
TrichordTree.defaultProps = {
    levels: 3,
};
