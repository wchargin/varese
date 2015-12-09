import React, {Component, PropTypes} from 'react';

import Folding from '../../Folding';
import TreeView from './TreeView';
import TrichordView from './TrichordView';

export default class TrichordTree extends Component {

    constructor() {
        super();
        this.state = {
            levels: 4,
        };
    }

    render() {
        const {rootChord, onClickChord} = this.props;
        const {levels} = this.state;
        const size = levels <= 4 ? 3 :
            levels <= 5 ? 2 :
            1;

        const chords = this._generateTree(rootChord, levels);
        const nodes = chords.map(row => row.map(chord =>
            <TrichordView
                notes={chord}
                onClick={() => onClickChord(chord)}
                size={size}
            />));
        return <div>
            <ViewOptions
                levels={levels}
                onSetLevels={levels => this.setState({ levels })}
            />
            <TreeView
                elements={nodes}
                spacing={2 * size}
            />;
        </div>;
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
    size: PropTypes.oneOf([1, 2, 3]),
    onClickChord: PropTypes.func.isRequired,
};

class ViewOptions extends Component {

    render() {
        return <div>
            <label forName="depth">Tree depth</label>
            <div className="input-group">
                <input
                    ref="levels"
                    type="range"
                    id="depth"
                    min={1}
                    max={6}
                    value={this.props.levels}
                    onChange={() => this.props.onSetLevels(
                        parseInt(this.refs.levels.value, 10))}
                />
            </div>
        </div>;
    }

}
