/*
 * A toolbar to be displayed near the chord tree explorer,
 * offering operations on the root node.
 */
import React, {Component, PropTypes} from 'react';

import {infoldCanonical, invert} from '../../Folding';
import {arraysEqual} from '../../Utils';

export default class ActionBar extends Component {

    render() {
        const {rootChord, onSetChord} = this.props;

        const infolded = infoldCanonical(rootChord);
        const hasInfolding = !arraysEqual(infolded, rootChord);

        const inversion = invert(rootChord);
        const hasInversion = !arraysEqual(inversion, rootChord);

        return <div style={{ textAlign: "left", marginBottom: 10 }}>
            <strong>Root node manipulation:</strong>
            {" "}
            <div
                className="btn-group"
                role="group"
            >
                <button
                    className="btn btn-default"
                    disabled={!hasInfolding}
                    onClick={() => onSetChord(infolded)}
                >Infold</button>
                <button
                    className="btn btn-default"
                    disabled={!hasInversion}
                    onClick={() => onSetChord(inversion)}
                >Invert</button>
            </div>
        </div>;
    }

}
ActionBar.propTypes = {
    rootChord: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    onSetChord: PropTypes.func.isRequired,
};
