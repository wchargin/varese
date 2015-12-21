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
import SingleNoteInput from '../SingleNoteInput';

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
        const visible = withinLimits(this.props.notes, this.props.limits);

        const {notes} = this.props;
        const notesAscending  = [...notes].sort((a, b) => a - b);
        const {noteNames, semitoneNames} = formatPitchesAndSemitones(
            notes, this.props);

        const noteViews = noteNames.map((name, index) => {
            if (this.props.onChange) {
                return <SingleNoteInput
                    ref={"note-" + index}
                    key={"note-" + index}
                    type="text"
                    displayValue={name}
                    value={notesAscending[index]}
                    style={{ textAlign: "center", width: "100%" }}
                    onChange={(newPitch, displayText) =>
                        this._handleChange(index, newPitch, displayText)}
                />;
            } else {
                return <strong key={"note-" + index}>{name}</strong>;
            }
        });

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
            ...noteViews.slice().reverse(),      // show descending
            this.props.showRoot && rootView,
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
                <ActionBar
                    chord={notes}
                    onSetChord={this.props.onChange}
                />
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
            {formatMaybeRoot(maybeRootPitch, this.props)}
        </strong>;
    }

    /*
     * Parameters:
     *   - 'noteIndex' is the index of the note that has changed,
     *     where the bottom-most note in the chord has index 0;
     *   - 'newNote' is the new value for that note,
     *     as a number of semitones above middle C;
     *   - 'displayText' is the text value of the input that changed,
     *     which may need to be copied to a different input box.
     */
    _handleChange(noteIndex, newNote, displayText) {
        this._updatePitch(noteIndex, newNote, displayText);
    }

    _updatePitch(noteIndex, newNote, maybeDisplayText) {
        const {notes} = this.props;
        const newNotes = [
            ...notes.slice(0, noteIndex),
            newNote,
            ...notes.slice(noteIndex + 1),
        ];

        // Now here comes the tricky part.
        // We need to sort the notes so the chord is still ascending,
        // but if this causes the focus to switch---
        // e.g., you edit the middle note and make it higher than the high note
        // so that further edits to the same "thing"
        // should actually change the high note---
        // then we need to keep track of that.
        const oldIndex = noteIndex;
        const taggedNotes = newNotes.map((note, thisIndex) => ({
            note,
            isTarget: thisIndex === oldIndex,
        }));
        const notesAscending = [...taggedNotes].sort((a, b) =>
            a.note - b.note);
        const newIndex = notesAscending.findIndex(note => note.isTarget);

        // Handle that case where a note's position in the chord has changed.
        if (newIndex !== noteIndex) {
            const oldRef = this.refs["note-" + oldIndex];
            const newRef = this.refs["note-" + newIndex];
            newRef.takeStateFrom(oldRef, maybeDisplayText);
        }

        // Finally, we can just discard the tagging information.
        this.props.onChange(notesAscending.map(x => x.note));
    }

}
TrichordView.propTypes = {
    rationalizer: PropTypes.func.isRequired,
    notes: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    onClick: PropTypes.func,
    size: PropTypes.oneOf([1, 2, 3]),
    onChange: PropTypes.func,  // if provided, will make this node editable.
    showRoot: PropTypes.bool.isRequired,
    showOctave: PropTypes.bool.isRequired,
    limits: CustomPropTypes.limits,
};
TrichordView.defaultProps = {
    size: 3,
};
