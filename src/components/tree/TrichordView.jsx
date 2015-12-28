import React, {Component, PropTypes} from 'react';

import {findChordRootOffset} from '../../core/HarmonicSeries';
import {flatten} from '../../utils/Utils';
import {
    withinLimits,
    formatMaybeRoot,
    formatPitchesAndSemitones,
} from '../../utils/DisplayUtils';

import CustomPropTypes from '../CustomPropTypes';

import ActionBar from './ActionBar';
import ChordEngraving from '../ChordEngraving';
import StackedNoteInput from '../StackedNoteInput';

export default class TrichordView extends Component {
    constructor() {
        super();
        this.state = {
            hovered: false,
        };
    }

    render() {
        // If we're not within limits,
        // we still need to render a component of the right size
        // so that the grid layout isn't thrown off.
        // But we'll lower the opacity of the main content,
        // and set the engraving's 'visibility' to 'hidden'.
        const visible = withinLimits(
            this.props.notes, this.props.viewOptions.limits);

        const {notes} = this.props;
        const notesAscending  = [...notes].sort((a, b) => a - b);
        const {noteNames, semitoneNames} = formatPitchesAndSemitones(
            notes, this.props.viewOptions);

        const noteViews = this.props.onChange ?
            [<StackedNoteInput
                value={notesAscending}
                onChange={this.props.onChange}
                style={{ display: "inline-block", width: "100%" }}
                inputProps={{
                    style: {
                        textAlign: "center",
                        display: "block",
                    },
                }}
                viewOptions={this.props.viewOptions}
                key="edit-view"
            />] :
            (noteNames
                .map((name, index) =>
                     <strong key={"note-" + index}>{name}</strong>)
                .slice().reverse());

        const rootView = this._renderRootView(notesAscending);

        const semitoneViews = semitoneNames.map((name, index) =>
            <span key={"semitone-" + index}>{name}</span>);

        const style = {
            display: "inline-block",
            textAlign: "center",
            padding: 2 * this.props.size,
            fontSize: 8 + 2 * this.props.size,
            opacity: visible ? 1 : 0.2,
        };

        const lines = [
            ...noteViews,
            this.props.viewOptions.showRoots && rootView,
            ...semitoneViews.slice().reverse(),  // show descending
        ];
        const flattenedContents = flatten(lines.map((line, idx) =>
            line && [line, <br key={"br-" + idx} />]));

        const info = this.props.onClick ?
            <button onClick={this.props.onClick} style={style}>
                {flattenedContents}
            </button> :
            <div style={style} className="well">
                {flattenedContents}
                {this.props.onChange && <ActionBar
                    chord={notes}
                    onSetChord={this.props.onChange}
                />}
            </div>;

        const hide = !visible && this.props.onClick;
        const hoverView = this.state.hovered && !hide ?
            <ChordEngraving notes={notes} /> : null;

        return <div
            style={{
                display: "inline-block",
                position: "relative",
            }}
            onMouseEnter={() => this.setState({ hovered: true })}
            onMouseLeave={() => this.setState({ hovered: false })}
        >
            {info}
            {hoverView &&
                <div className="panel panel-default" style={{
                    position: "absolute",
                    bottom: "100%",
                    marginBottom: 5,
                    zIndex: 3,
                    //
                    // These next two properties center horizontally:
                    // http://stackoverflow.com/a/23384995
                    left: "50%",
                    transform: "translateX(-50%)",
                }}>
                    <div className="panel-body">
                        {hoverView}
                    </div>
                </div>}
        </div>;
    }

    _renderRootView(notes) {
        const maybeRootPitch = findChordRootOffset(
            this.props.rationalizer, notes);
        return <strong key="root" style={{ color: "blue" }}>
            {formatMaybeRoot(maybeRootPitch, this.props.viewOptions)}
        </strong>;
    }

}
TrichordView.propTypes = {
    rationalizer: PropTypes.func.isRequired,
    notes: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    //
    viewOptions: CustomPropTypes.viewOptions.isRequired,
    size: PropTypes.oneOf([1, 2, 3]),
    //
    onClick: PropTypes.func,
    onChange: PropTypes.func,  // if provided, will make this node editable.
};
TrichordView.defaultProps = {
    size: 3,
};
