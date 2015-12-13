import React, {Component, PropTypes} from 'react';

import {findChordRootOffset} from '../../HarmonicSeries';
import {pitchToName, nameToPitch} from '../../PitchNames';
import {flatten} from '../../Utils';

import ActionBar from './ActionBar';
import ChordEngraving from '../ChordEngraving';

export default class TrichordView extends Component {
    constructor() {
        super();
        this.state = {
            hovered: false,
        };
    }

    _withinLimits() {
        if (!this.props.limits) {
            return true;
        }
        const {notes: unsortedNotes, limits} = this.props;
        const notes = [...unsortedNotes].sort((a, b) => a - b);

        const span = notes[notes.length - 1] - notes[0];
        if (limits.minCombinedEnabled && span < limits.minCombined) {
            return false;
        }
        if (limits.maxCombinedEnabled && span > limits.maxCombined) {
            return false;
        }

        const deltas = notes.slice(1).map((snd, idx) => snd - notes[idx]);
        if (limits.minIndividualEnabled && deltas.some(x =>
                x < limits.minIndividual)) {
            return false;
        }
        if (limits.maxIndividualEnabled && deltas.some(x =>
                x > limits.maxIndividual)) {
            return false;
        }

        return true;
    }

    render() {
        // If we're not within limits,
        // we still need to render a component of the right size
        // so that the grid layout isn't thrown off.
        // But we'll lower the opacity of the main content,
        // and set the engraving's 'visibility' to 'hidden'.
        const visible = this._withinLimits();

        const {notes, showOctave} = this.props;
        const notesAscending  = [...notes].sort((a, b) => a - b);
        const notesDescending = [...notes].sort((a, b) => b - a);

        const [low, med, high] = notesAscending;
        const names = notesDescending.map(x =>
            pitchToName(x, true, showOctave));
        const noteViews = names.map((name, index) => {
            if (this.props.onChange) {
                return <SingleNoteInput
                    ref={"note-" + index}
                    key={"note-" + index}
                    type="text"
                    displayValue={name}
                    value={pitchToName(notesDescending[index], true)}
                    style={{ textAlign: "center" }}
                    onChange={(newPitch, displayText) =>
                        this._handleChange(index, newPitch, displayText)}
                />;
            } else {
                return <strong key={"note-" + index}>{name}</strong>;
            }
        });

        const rootView = this._renderRootView(notesAscending);

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
            opacity: visible ? 1 : 0.2,
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
        const flattenedContents = flatten(lines.map((line, idx) =>
            line && [line, <br key={"br-" + idx} />]));

        const info = this.props.onClick ?
            <button onClick={this.props.onClick} style={buttonStyle}>
                {flattenedContents}
            </button> :
            <div style={divStyle}>
                {flattenedContents}
                <ActionBar
                    chord={notes}
                    onSetChord={this.props.onChange}
                />
            </div>;
        const hoverView = this.state.hovered && visible ?
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
                <div className="well" style={{
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
                    {hoverView}
                </div>}
        </div>;
    }

    _renderRootView(notes) {
        const {rationalizer, showOctave} = this.props;

        const createRootView = text =>
            <strong key="root" style={{ color: "blue" }}>{text}</strong>;

        const maybeRootPitch = findChordRootOffset(rationalizer, notes);
        if (maybeRootPitch.status === "success") {
            const rootPitch = maybeRootPitch.result;
            const rootName = pitchToName(rootPitch, true, showOctave);
            return createRootView(rootName);
        } else {
            const e = maybeRootPitch.error;
            if (e.match(/finite/) || e.match(/zero_ratio/)) {
                return createRootView("?");
            } else {
                throw e;
            }
        }
    }

    /*
     * Okay. The parameters here can get a tad confusing.
     *   - 'noteIndex' is the index into the *descending* array of notes;
     *   - 'newNote' is the new value for that note;
     *   - 'displayText' is the text value of the input that changed,
     *     which may need to be copied to a different input box.
     */
    _handleChange(noteIndex, newNote, displayText) {
        const notes = [...this.props.notes].sort((a, b) => b - a);
        const newNotes = [
            ...notes.slice(0, noteIndex),
            newNote,
            ...notes.slice(noteIndex + 1),
        ];

        // Now here comes the tricky part.
        // We need to sort the notes so the chord is still in the right order,
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
        const notesDescending = [...taggedNotes].sort((a, b) =>
            b.note - a.note);
        const newIndex = notesDescending.findIndex(note => note.isTarget);

        // Handle that case where a note's position in the chord has changed.
        if (newIndex !== noteIndex) {
            const oldRef = this.refs["note-" + oldIndex];
            const newRef = this.refs["note-" + newIndex];
            newRef.takeStateFrom(oldRef, displayText);
        }

        // Finally, the notes actually need to be in ascending order,
        // and we can discard the tagging information.
        const notesAscending = [...newNotes].sort((a, b) => a - b);
        this.props.onChange(notesAscending);
    }

}
TrichordView.propTypes = {
    rationalizer: PropTypes.func.isRequired,
    notes: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    onClick: PropTypes.func,
    size: PropTypes.oneOf([1, 2, 3]),

    // If provided, will make this node editable.
    onChange: PropTypes.func,

    showRoot: PropTypes.bool.isRequired,
    showOctave: PropTypes.bool.isRequired,

    // This prop isn't required, but if it's present all the keys should exist.
    limits: PropTypes.shape({
        minCombined: PropTypes.number.isRequired,
        maxCombined: PropTypes.number.isRequired,
        minIndividual: PropTypes.number.isRequired,
        maxIndividual: PropTypes.number.isRequired,
        minCombinedEnabled: PropTypes.bool.isRequired,
        maxCombinedEnabled: PropTypes.bool.isRequired,
        minIndividualEnabled: PropTypes.bool.isRequired,
        maxIndividualEnabled: PropTypes.bool.isRequired,
    }),
};
TrichordView.defaultProps = {
    size: 3,
};

/*
 * Input node for a single pitch.
 * Allows a separate "display text" from "default editing text":
 * for example, if octaves are hidden, the display text might be "C",
 * but the default editing text should be something like "C5",
 * because the user will be required to enter the octave
 * even when the octaves are hidden;
 * in other words, the default editing text must always parse.
 *
 * When the user makes a change that parses to a valid note,
 * the onChange callback is invoked with two arguments:
 * first, the new pitch as a number (semitones above middle C, as is standard),
 * and second, the current editing text;
 * the latter might be something like "cb5",
 * which is distinct from the actual "C[flat-symbol]5"
 * that would be output from the pretty-printer.
 * In most cases, the callback won't need the editing text, but...
 *
 * In some cases, a change event might induce changes beyond just this pitch.
 * For example, if the note being edited is the E in a C4, E4, G4 chord
 * and the user changes the "E4" to an "e5" (note the lowercase),
 * then the chord suddenly becomes C4, G4, E5;
 * in particular, the contents of the G4 and E5 input fields must interchange.
 * The 'takeStateFrom' method exists to help solve this problem:
 * in the case above, the callback function should make a call like
 *     topInputNode.takeStateFrom(middleInputNode, displayText),
 * where 'displayText' is, in the case, "e5".
 * Immediately after this call, the state will look like "C4, E4, e5",
 * but presumably this will have triggered a re-render
 * that will update the state of the no-longer-focused middle node.
 *
 * Still confused? It may help to check out
 * the _handleChange method of TrichordView,
 * which is the consumer of this API.
 */
class SingleNoteInput extends Component {

    constructor() {
        super();
        this.state = {
            text: null,
        };
    }

    render() {
        const text = this.state.text !== null ?
            this.state.text :
            this.props.displayValue;
        return <input
            ref="input"
            type="text"
            value={text}
            onChange={() => this._handleChange()}
            onFocus={() => this.setState({ text: this.props.value })}
            onBlur={() => this.setState({ text: null })}
            style={this.props.style}
        />;
    }

    /*
     * Copy the input state from another SingleNoteInput,
     * and reset that input's state to the default state;
     * that is, roughly, consume the state, don't borrow it.
     */
    takeStateFrom(that, text) {
        const thisInput = this.refs.input;
        const thatInput = that.refs.input;

        // Grab state before an onFocus handler mutates it.
        const thatOldState = that.state;

        // Copy focus.
        if (document.activeElement === thatInput) {
            thisInput.focus();
        }

        // Copy state.
        this.setState({...thatOldState, text});
        that.setState({ text: null });
    }

    _handleChange() {
        const text = this.refs.input.value;
        this.setState({ text });

        const value = nameToPitch(text);
        if (value !== null) {
            this.props.onChange(value, text);
        }
    }

}
SingleNoteInput.propTypes = {
    displayValue: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,

    // (number, string) => void; takes
    //   * the new pitch after successful parse, and
    //   * the current text entered by the user,
    //     which might need to be copied to a different element.
    onChange: PropTypes.func.isRequired,

    style: PropTypes.object,
};
