import React, {Component, PropTypes} from 'react';

import PitchNames from '../../PitchNames';

export default class TrichordView extends Component {
    render() {
        const {notes} = this.props;
        const [low, med, high] = notes;
        const names = notes.map(x => PitchNames.pitchToName(x, true));
        const chordName = names.join(", ");

        const [d1, d2] = [med - low, high - med];
        const semitonesName = `[${d1}][${d2}]`;

        const style = {
            display: "inline-block",
            textAlign: "center",
            padding: 2 * this.props.size,
            fontSize: 8 + 2 * this.props.size,
        };
        const buttonStyle = {...style};
        const divStyle = {
            ...style,
            backgroundColor: "#f5f5f5",
            border: "thin #e3e3e3 solid",
            borderRadius: 2,
            boxShadow: "inset 0 1px 1px rgba(0,0,0,.05)",
            padding: 2 * style.padding,
        };

        return this.props.onClick ?
            <button onClick={this.props.onClick} style={buttonStyle}>
                <strong>{chordName}</strong><br />
                <span>{semitonesName}</span>
            </button> :
            <div style={divStyle}>
                <strong>{chordName}</strong><br />
                <span>{semitonesName}</span>
            </div>;
    }
}
TrichordView.propTypes = {
    notes: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    onClick: PropTypes.func,
    size: PropTypes.oneOf([1, 2, 3]),
};
TrichordView.defaultProps = {
    size: 3,
}
