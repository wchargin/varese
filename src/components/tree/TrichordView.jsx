import React, {Component, PropTypes} from 'react';

import HarmonicSeries from '../../HarmonicSeries';
import PitchNames from '../../PitchNames';

export default class TrichordView extends Component {
    render() {
        // TODO(william): make this a parameter to pitchToName
        const maybeTrimOctave = name =>
            this.props.showOctave ? name : name.replace(/\u2212?\d*$/, "");

        const {notes} = this.props;
        const [low, med, high] = notes.sort((a, b) => b - a);
        const names = notes.map(x =>
            maybeTrimOctave(PitchNames.pitchToName(x, true)));
        const noteViews = names.map((name, index) =>
            <strong key={"note-" + index}>{name}</strong>);

        // TODO(william): use the user's existing rationalizer
        const rootPitch = HarmonicSeries.findChordRootOffset(
            HarmonicSeries.canonicalRationalizer, notes);
        const rootName =
            maybeTrimOctave(PitchNames.pitchToName(rootPitch, true));
        const rootView =
            <strong
                key="root"
                style={{ color: "blue" }}
            >{rootName}</strong>;

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
            this.props.showRoot && rootView,
            <span key="semitones-name">{semitonesName}</span>,
        ];
        const flattenedContents = [].concat.apply([], lines.map((line, idx) =>
            line && [line, <br key={"br-" + idx} />]));

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
