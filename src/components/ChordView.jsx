import React, {Component, PropTypes} from 'react';

import Vex from 'vexflow';
import VexFlowUtils from '../VexFlowUtils';

/*
 * Engrave a chord and display it!
 *
 * This involves a bit of hackery and goes outside the React lifecycle;
 * in particular, VexFlow expects to render into an existing DOM node
 * so we have to create one as a 'ref' during 'render'
 * and then actually render into it in 'componentDidMount'.
 * Not a big deal, though;
 * one intended use of the lifecycle methods
 * is dealing with legacy or external code, which this is.
 */
export default class ChordView extends Component {

    render() {
        return <div ref="outer" style={{
            padding: 10,
            borderRadius: 10,
            display: "inline-block",
        }} />
    }

    componentDidMount() {
        this._renderNote();
    }

    componentDidUpdate() {
        this._renderNote();
    }

    _renderNote() {
        const {notes, width, clef} = this.props;
        const chord = VexFlowUtils.pitchesToStaveNote(notes);

        // VexFlow supports, you know, actual music,
        // which generally comprises multiple notes in sequence.
        // So we need to wrap this in a singleton array.
        const chords = [chord];

        const svgContainer = document.createElement('div');
        const renderer = new Vex.Flow.Renderer(svgContainer,
            Vex.Flow.Renderer.Backends.SVG);
        const ctx = renderer.getContext();
        const stave = new Vex.Flow.Stave(0, 0, width);
        stave.addClef(clef).setContext(ctx).draw();

        const boundingBox = Vex.Flow.Formatter.FormatAndDraw(
            ctx, stave, chords);

        const svg = svgContainer.childNodes[0];
        const padding = 10;
        const halfPadding = padding / 2;

        svg.style.top =
            -boundingBox.y +
            halfPadding +
            //
            // This next line seems to get it about right most of the time.
            Math.max(0, (width - boundingBox.h) * 2 / 3) +
            "px";
        svg.style.height = Math.max(width, boundingBox.h);
        svg.style.left = "0px";
        svg.style.width = width + "px";
        svg.style.position = "absolute";
        svg.style.overflow = "visible";
        svgContainer.style.height =
            Math.max(width, boundingBox.h + padding) + "px";
        svgContainer.style.width = width + "px";
        svgContainer.style.position = "relative";
        svgContainer.style.display = "inlineBlock";

        // Clear container before adding anything.
        const container = this.refs.outer;
        while (container.childNodes.length > 0) {
            container.removeChild(container.childNodes[0]);
        }
        container.appendChild(svgContainer);
    }

}
ChordView.propTypes = {
    // Semitones above middle C.
    notes: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,

    // Width of the staff output, in pixels.
    width: PropTypes.number,

    clef: React.PropTypes.oneOf(["treble", "bass"]),
};
ChordView.defaultProps = {
    width: 100,
    clef: "treble",
};
