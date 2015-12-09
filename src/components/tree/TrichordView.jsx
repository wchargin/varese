import React, {Component, PropTypes} from 'react';

import PitchNames from '../../PitchNames';

export default class TrichordView extends Component {
    render() {
        const {notes} = this.props;
        const [low, med, high] = notes.sort((a, b) => b - a);
        const names = notes.map(x => PitchNames.pitchToName(x, true));
        const noteViews = names.map((name, index) =>
            <strong key={"note-" + index}>{name}</strong>);

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

        const lines = [
            ...noteViews,
            <span key="semitones-name">{semitonesName}</span>,
        ];
        const flattenedContents = [].concat.apply([],
            lines.map((line, index) => [line, <br key={"br-" + index} />]));

        return this.props.onClick ?
            React.createElement("button",
                { onClick: this.props.onClick, style: buttonStyle },
                flattenedContents) :
            React.createElement("div",
                { style: divStyle },
                flattenedContents);
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
