/*
 * An input widget for a chord comprising a fixed number of notes,
 * displayed in separate text boxes that the user may edit.
 */
import React, {Component, PropTypes} from 'react';
import CustomPropTypes from './CustomPropTypes';

import {pitchToName, parseNameOrPitch} from '../core/PitchNames';

export default class StackedNoteInput extends Component {

    constructor() {
        super();
        this.state = {
            focusedIndex: null,
            focusedText: null,
        };
    }

    render() {
        return <div style={this.props.style}>
            {this.props.value
                .map((value, index) => this._renderInput(value, index))
                .reverse()}
        </div>;
    }

    componentDidUpdate(oldProps, oldState) {
        const newFocusedIndex = this.state.focusedIndex;
        const oldFocusedIndex = oldState.focusedIndex;
        if (newFocusedIndex !== null && newFocusedIndex !== oldFocusedIndex) {
            this.refs['input-' + newFocusedIndex].focus();
        }
    }

    _renderInput(value, index) {
        return <input
            type="text"
            value={this._getTextForInputField(value, index)}
            ref={'input-' + index}
            onChange={e => this._handleChange(e.target.value, index)}
            onFocus={() => this.setState({ focusedIndex: index })}
            onBlur={() => {
                // Only reset the text if
                // the text field was exited directly,
                // not if another one has already been activated
                // due to the 'componentDidUpdate' hook.
                if (this.state.focusedIndex === index) {
                    this.setState({
                        focusedIndex: null,
                        focusedText: null,
                    });
                }
            }}
            onKeyDown={e => this._handleKeyDown(e, index)}
            key={index}
            {...this.props.inputProps}
        />;
    }

    _getTextForInputField(value, index) {
        // When the input isn't focused,
        // always format the prop-provided value,
        // respecting the view options.
        if (this.state.focusedIndex !== index) {
            const {showOctaves} = this.props.viewOptions;
            return pitchToName(value, true, showOctaves);
        }

        // When the input's focused
        // but the user hasn't input any text,
        // display the prop-provided value
        // but force octaves to be shown
        // so that the initial value parses to the original input.
        // (If we omitted the octaves here,
        // then a note like "C5", when displayed as just "C",
        // would parse in relative pitch notation to C4,
        // which would be confusing because
        // the value would have changed just by focusing the text field.)
        if (this.state.focusedText === null) {
            return pitchToName(value, true, true);
        }

        // Otherwise, the input is focused and the user is entering text;
        // display that so they can keep editing.
        return this.state.focusedText;
    }

    _handleChange(newText, noteIndex) {
        const newNote = parseNameOrPitch(newText);
        if (newNote === null) {
            // Parse failed. No problem; the user's still typing.
            this.setState({
                focusedText: newText,
            });
            return;
        } else {
            // Parse succeeded. Update the note in the chord.
            this._updateNote(newNote, newText, noteIndex);
        }
    }

    _handleKeyDown(e, noteIndex) {
        const direction = ({
            "ArrowUp": +1,
            "ArrowDown": -1,
        })[e.key];

        // Ignore other keys.
        if (direction === undefined) {
            return;
        }

        // Don't move the cursor around
        // (and don't select everything when holding shift).
        e.preventDefault();

        // Jump full octaves when holding shift.
        const delta = e.shiftKey ? direction * 12 : direction;
        const newNote = this.props.value[noteIndex] + delta;
        this._updateNote(newNote, pitchToName(newNote, true, true), noteIndex);
    }

    _updateNote(newNote, newText, noteIndex) {
        // Replace the old note in the chord.
        const notes = this.props.value;
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
        // should actually change the (new) high note---
        // then we need to keep track of that.
        const oldIndex = noteIndex;
        const taggedNotes = newNotes.map((note, thisIndex) => ({
            note,
            isTarget: thisIndex === oldIndex,
        }));
        const taggedNotesAscending = [...taggedNotes].sort((a, b) =>
            a.note - b.note);
        const newIndex = taggedNotesAscending.findIndex(note => note.isTarget);
        this.setState({
            focusedIndex: newIndex,
            focusedText: newText,
        });

        // Finally, we can just discard the tagging information.
        const notesAscending = taggedNotesAscending.map(x => x.note);
        this.props.onChange(notesAscending);
    }

}
StackedNoteInput.propTypes = {
    value: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    onChange: PropTypes.func.isRequired,
    viewOptions: CustomPropTypes.viewOptions.isRequired,
    //
    style: PropTypes.object,        // optional
    inputProps: PropTypes.object,   // optional
};
