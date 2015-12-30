/*
 * A mostly unbounded canvas for rendering trees of trichord outfoldings.
 * ("Mostly" unbounded because all Numbers are double-precision floats,
 * so we can't go past any rows with more than ~2^53 nodes.)
 *
 * Writing a canvas-based component is a different experience
 * than writing most React components,
 * because the canvas is immediate-mode
 * so doesn't really fit well into the React declarative flow.
 * To make this more declarative---and, importantly, more unit-testable---
 * the main logic is in two other modules:
 *
 *   - the 'src/core/CanvasCore' module
 *     comprises a suite of entirely pure functions
 *     that handle the core logic for controlling the canvas position
 *     and determine what should be displayed when; and
 *
 *   - the 'src/core/CanvasUIAdapter' module
 *     provides event handlers and lifecycle mixins
 *     that are modularized enough to be unit-tested separately
 *     (although they do require some mocking
 *     to interface with things like 'window.addEventListener').
 *
 * In a nutshell, if you're looking to modify the *behavior*,
 * look into one of those modules;
 * if you're looking to alter the *appearance*,
 * you should find what you need in `_draw` and friends in this module.
 */
import React, {Component, PropTypes} from 'react';
import CustomPropTypes from '../CustomPropTypes';

import Vex from 'vexflow';

import {findChordRootOffset} from '../../core/HarmonicSeries';
import {positionToPitches} from '../../core/TreeSpace';
import {pitchesToStaveNote} from '../../utils/VexFlowUtils';
import {
    withinLimits,
    formatMaybeRoot,
    formatPitchesAndSemitones,
} from '../../utils/DisplayUtils';

import * as CanvasCore from '../../core/CanvasCore';
import * as CanvasUIAdapter from '../../core/CanvasUIAdapter';

export default class InfiniteCanvas extends Component {

    constructor() {
        super();

        this.state = {
            uiState: CanvasUIAdapter.initialState(),
        };
        const getState = () => this.state.uiState;
        const setState = uiState => this.setState({ uiState });
        const getCanvas = () => this.refs.canvas;

        this._canvasEventHandlers = CanvasUIAdapter.createHandlers(
            getState, setState);
        CanvasUIAdapter.mixInLifecycles(this,
            CanvasUIAdapter.createLifecycleMixins(
                getState, setState, getCanvas));

        // These let us get properties from the UI state
        // without having to know its internal structure.
        this._getCoreState = CanvasUIAdapter.getCoreAccessor(getState);
        this._getLastMouse = CanvasUIAdapter.getMouseAccessor(getState);

        // Two functions are memoized for scrolling performance.
        // These maps are used to cache the results,
        // and are invalidated on every prop change for simplicity.
        this._fastFindChordRootOffsetMemo = new Map();
        this._fastPositionToPitchesMemo = new Map();
    }

    render() {
        return <canvas
            ref="canvas"
            width={720}
            height={this.props.viewOptions.infiniteHeight}
            style={{
                boxShadow: '0 0 2px 1px rgba(0, 0, 0, 0.2)',
                borderRadius: 2,
                width: "100%",
                height: this.props.viewOptions.infiniteHeight,
            }}
            {...this._canvasEventHandlers}
            tabIndex={0}
        >
            <div className="alert alert-danger">
                <strong>Uh oh!</strong>
                {" "}
                Looks like your browser doesn't support
                the <tt>&lt;canvas&gt;</tt> element.
                Basically, this means we can't show you the infinite tree.
                Could you try upgrading your browser?
            </div>
        </canvas>;
    }

    componentDidMount() {
        this._draw();
    }

    componentWillReceiveProps() {
        // Some prop changes can invalidate these caches.
        // We just clear them always for simplicity.
        this._fastFindChordRootOffsetMemo.clear();  // <= rationalizer
        this._fastPositionToPitchesMemo.clear();    // <= treeNumber, rootBass
    }

    componentDidUpdate() {
        this._draw();
    }

    _draw() {
        const {canvas} = this.refs;
        const coreState = this._getCoreState();

        const ctx = canvas.getContext('2d', {alpha: 'false'});
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        CanvasCore.getRowsInView(coreState).forEach(row =>
            CanvasCore.getColumnsInView(coreState, row).forEach(col => {
                const {x, y} = CanvasCore.getNodeCanvasCoordinates(
                    coreState, row, col);
                // Avoid painting rows that are just out of bounds.
                if (y < canvas.height) {
                    this._drawNode(ctx, row, col, x, y);
                }
            }));
    }

    _drawNode(ctx, row, col, x, y) {
        const {viewOptions} = this.props;
        const notes = this._fastPositionToPitches(row, col);
        const visible = withinLimits(notes, this.props.viewOptions.limits);
        const {noteNames, semitoneNames} = formatPitchesAndSemitones(
            notes, viewOptions);

        // Get smaller as we go further down the tree
        // so we can fit more nodes in when we need to.
        const scale = 0.5 + 0.5 *
            Math.sqrt(Math.max(0, 1 - y / ctx.canvas.height));

        const lines = [
            ...noteNames.slice().reverse().map(x => ({text: x})),
            ...(viewOptions.showRoots ?
                [{
                    text: formatMaybeRoot(
                        this._fastFindChordRootOffset(notes),
                        viewOptions),
                    root: true,
                }] :
                []),
            ...semitoneNames.slice().reverse().map(x => ({text: x})),
        ];

        // Set up fonts now because we have some metrics to handle below.
        const fontFamily = '"Helvetica Neue",Helvetica,Arial,sans-serif';

        // Unless we're optimizing for display quality,
        // we round the font size and line height to integers
        // because it helps immensely with rendering speed.
        const maybeRound = viewOptions.highQuality ? x => x : Math.round;
        const fontSize = maybeRound(14 * scale);
        const lineHeight = maybeRound(1.2 * fontSize);
        ctx.font = `${fontSize}px ${fontFamily}`;

        // Profiling indicates that measureText is a bottleneck,
        // so this is a little heuristic to avoid calls...
        const lineWidth = line =>
            line.text.length * (line.root ? 1.2 : 1);
        const longestLine = ctx.measureText(lines.reduce((best, line) =>
            lineWidth(line) > lineWidth(best) ? line : best).text).width;

        // Determine the bounds for the enclosing rectangle.
        const padding = 5;
        const width = longestLine + 2 * padding;
        const height = lineHeight * lines.length + 2 * padding;

        // HSV is great! But we have to use HSL :(
        const satHSV = viewOptions.rainbowFactor * 0.2;
        const value = 1.0;
        const baseLight = value * 0.5 * (2 - satHSV);
        const light = visible ? baseLight : (baseLight * 0.2 + 0.8);
        const sat = satHSV && value * satHSV / (1 - Math.abs(2 * light - 1));
        const hslString = (h, s, l) =>
            `hsl(${h * 360}, ${s * 100}%, ${l * 100}%)`;
        ctx.fillStyle = hslString(row / 16, sat, light);
        ctx.strokeStyle = hslString(row / 16, sat, visible ? 0.25 : 0.8);

        // Finally, draw and fill the rectangle...
        ctx.beginPath();
        this._roundRect(ctx,
            Math.round(x - width / 2),
            Math.round(y),
            Math.round(width),
            Math.round(height),
            padding);
        ctx.stroke();
        ctx.fill();

        // ...then paint the text!
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const rootStyle = visible ? "blue" : "#DDF";
        const nonRootStyle = visible ? "black" : "#DDD";
        lines.forEach((data, index) => {
            ctx.fillStyle = data.root ? rootStyle : nonRootStyle;
            const boldTag = data.root ? "bold " : "";
            ctx.font = `${boldTag}${fontSize}px ${fontFamily}`;
            ctx.fillText(data.text + "",
                Math.round(x),
                Math.round(y) + padding + index * lineHeight);
        });

        // Draw the engraving when the node is hovered.
        const engrave = () => {
            this._drawEngraving(ctx, notes, x, y, width);
        };
        if (viewOptions.alwaysEngrave) {
            engrave();
        } else {
            const lastMouse = this._getLastMouse();
            if (lastMouse) {
                const {x: mouseX, y: mouseY} = lastMouse;
                const withinX = Math.abs(mouseX - x) <= width / 2;
                const withinY = y <= mouseY && mouseY <= y + height;
                if (withinX && withinY) {
                    engrave();
                }
            }
        }
    }

    /*
     * Given the horizontal center ('cx') and vertical top ('ty') of a box
     * whose width is 'bw',
     * engrave the given notes near (but outside) the box
     * using the provided 2D canvas context.
     */
    _drawEngraving(ctx, notes, cx, ty, bw) {
        const chord = pitchesToStaveNote(notes);
        const chords = [chord];

        const renderer = new Vex.Flow.Renderer(ctx.canvas,
            Vex.Flow.Renderer.Backends.CANVAS);
        const vexctx = renderer.getContext();
        const notesWidth = 100;
        const padding = 5;
        const stave = new Vex.Flow.Stave(
            cx > ctx.canvas.width / 2 ?
                cx - padding - bw / 2 - notesWidth :
                cx + padding + bw / 2,
            ty - 25,  // offset seems to be entirely static
            notesWidth);
        stave.addClef("treble").setContext(vexctx).draw();
        Vex.Flow.Formatter.FormatAndDraw(vexctx, stave, chords);
    }

    /*
     * Assuming a path has been started on the given context,
     * draw a rounded rectangle with the given top-left corner and dimensions
     * and the given border-radius.
     * (The path is not stroked or filled.)
     */
    _roundRect(ctx, x, y, w, h, r) {
        const p2 = Math.PI / 2;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arc(x + w - r, y + r, r, 3 * p2, 0);
        ctx.lineTo(x + w, y + h - r);
        ctx.arc(x + w - r, y + h - r, r, 0, p2);
        ctx.lineTo(x + r, y + h);
        ctx.arc(x + r, y + h - r, r, p2, 2 * p2);
        ctx.lineTo(x, y + r);
        ctx.arc(x + r, y + r, r, 2 * p2, 3 * p2);
    }

    _fastFindChordRootOffset(notes) {
        // Ugly, but should work for our case (all integers).
        const key = notes.join(",");
        const memo = this._fastFindChordRootOffsetMemo;
        if (!memo.has(key)) {
            memo.set(key, findChordRootOffset(this.props.rationalizer, notes));
        }
        return memo.get(key);
    }

    _fastPositionToPitches(row, col) {
        const key = `${row},${col}`;
        const memo = this._fastPositionToPitchesMemo;
        if (!memo.has(key)) {
            const notes = positionToPitches(
                this.props.viewOptions.treeNumber,
                row, col,
                this.props.viewOptions.rootBass);
            memo.set(key, notes);
        }
        return memo.get(key);
    }

}
InfiniteCanvas.propTypes = {
    viewOptions: CustomPropTypes.viewOptions.isRequired,
    rationalizer: PropTypes.func.isRequired,
};
