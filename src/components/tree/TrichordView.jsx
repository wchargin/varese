import React, {Component, PropTypes} from 'react';

import HarmonicSeries from '../../HarmonicSeries';
import PitchNames from '../../PitchNames';

import ChordEngraving from '../ChordEngraving';

export default class TrichordView extends Component {
    constructor() {
        super();
        this.state = {
            hovered: false,
        };
    }

    render() {
        // TODO(william): make this a parameter to pitchToName
        const maybeTrimOctave = name =>
            this.props.showOctave ? name : name.replace(/\u2212?\d*$/, "");

        const {notes} = this.props;
        const notesAscending  = [...notes].sort((a, b) => a - b);
        const notesDescending = [...notes].sort((a, b) => b - a);

        const [low, med, high] = notesAscending;
        const names = notesDescending.map(x =>
            maybeTrimOctave(PitchNames.pitchToName(x, true)));
        const noteViews = names.map((name, index) =>
            <strong key={"note-" + index}>{name}</strong>);

        const rootView = this._renderRootView(notesAscending, maybeTrimOctave);

        const semitones = [high - med, med - low];
        const semitoneNames = semitones.map(x =>
            `[${x}]`.replace(/-/, "\u2212"));
        const semitoneViews = semitoneNames.map((name, index) =>
            <span key={"semitone-" + index}>{name}</span>);

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
            ...semitoneViews,
        ];
        const flattenedContents = [].concat.apply([], lines.map((line, idx) =>
            line && [line, <br key={"br-" + idx} />]));

        const info = this.props.onClick ?
            <button onClick={this.props.onClick} style={buttonStyle}>
                {flattenedContents}
            </button> :
            <div style={divStyle}>
                {flattenedContents}
            </div>;
        const hoverView = this.state.hovered ?
            <ChordEngraving notes={notes} /> : null;

        return <div
            style={{
                display: "inline-block",
                position: "relative"
            }}
            onMouseEnter={() => this.setState({ hovered: true })}
            onMouseLeave={() => this.setState({ hovered: false })}
        >
            {info}
            {hoverView &&
                <div className="well" style={{
                    position: "absolute",
                    bottom: 0,
                    left: "100%",
                    marginLeft: 5,
                    zIndex: 1,
                }}>
                    {hoverView}
                </div>}
        </div>;
    }

    _renderRootView(notes, maybeTrimOctave) {
        const createRootView = text =>
            <strong key="root" style={{ color: "blue" }}>{text}</strong>;

        // TODO(william): use the user's existing rationalizer
        const maybeRootPitch = HarmonicSeries.findChordRootOffset(
            HarmonicSeries.canonicalRationalizer, notes);
        if (maybeRootPitch.status === "success") {
            const rootPitch = maybeRootPitch.result;
            const rootName =
                maybeTrimOctave(PitchNames.pitchToName(rootPitch, true));
            return createRootView(rootName);
        } else {
            const e = maybeRootPitch.error;
            if (e.match(/finite/)) {
                return createRootView("?");
            } else {
                throw e;
            }
        }
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
