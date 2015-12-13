/*
 * A toolbar with actions to edit a chord.
 * This can be attached to editable TrichordViews.
 */
import React, {Component, PropTypes} from 'react';

import {infoldCanonical, invert} from '../../Folding';
import {arraysEqual} from '../../Utils';

export default class ActionBar extends Component {

    render() {
        const {chord, onSetChord} = this.props;

        const infolded = infoldCanonical(chord);
        const hasInfolding = !arraysEqual(infolded, chord);

        const inversion = invert(chord);
        const hasInversion = !arraysEqual(inversion, chord);

        const style = {
            textAlign: "center",
            marginBottom: 10,
            marginTop: 10,
        };

        return <div style={style}>
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
    chord: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    onSetChord: PropTypes.func.isRequired,
};
