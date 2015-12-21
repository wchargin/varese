/*
 * A mostly unbounded canvas for rendering trees of trichord outfoldings.
 * ("Mostly" unbounded because all Numbers are double-precision floats,
 * so we can't go past any rows with more than ~2^53 nodes.)
 *
 * This component is a bit lower-level than most React components,
 * because it's implemented entirely with the <canvas> API.
 * Most of the math (read: arithmetic) is contained in _draw and _drawNode,
 * so the only things you really need to be familiar with elsewhere
 * are the different coordinate systems in use.
 *
 * There are three coordinate systems in use:
 *
 *   - "Canvas coordinates" are the actual drawing coordinates of the canvas.
 *     The origin is at the top-left of the current viewport,
 *     the basis vectors point to the right and downward,
 *     and the scaling factor is as with the canvas:
 *     that is, (canvas.width, canvas.height) is the bottom-right corner.
 *
 *   - "Absolute coordinates" use
 *     the same orientation as the normal canvas coordinates,
 *     but the origin is at the very top-left of the *possible* view,
 *     not the current view.
 *     That the scale is the same as
 *     the scale used by the canvas coordinates when y = 0.
 *
 *   - "Idealized coordinates" are the easiest to work with mathematically.
 *     The origin is at the top-center of the tree,
 *     and the basis vectors point to the right and downward.
 *     A distance of one unit in the y direction corresponds to one level,
 *     and the entire horizontal axis ranges from -0.5 to 0.5.
 *
 * In general, it's nice to keep things in idealized coordinates,
 * because they're robust to, e.g.,
 * window resizes or a change to 'this.props.viewOptions.infiniteLevels'.
 * So it's often a good idea to limit the other coordinate systems to drawing
 * or things that really are inherently tied to the canvas,
 * like the mouse position.
 */
import React, {Component, PropTypes} from 'react';
import CustomPropTypes from '../CustomPropTypes';

import {findChordRootOffset} from '../../HarmonicSeries';
import {positionToPitches} from '../../TreeSpace';
import {
    withinLimits,
    formatMaybeRoot,
    formatPitchesAndSemitones,
} from '../../DisplayUtils';

export default class InfiniteCanvas extends Component {

    constructor() {
        super();
        this.state = {
            // The 'position' field locates the viewport,
            // which is anchored with top-center gravity
            // and described in idealized coordinates.
            position: {
                x: 0,
                y: 0,
            },
            lastMouse: null,  // canvas coordinates; null unless dragging
            keysDown: [],     // a list of numeric key codes
        };

        // We attach the following properties to the instance itself
        // instead of using React's state
        // because they're orthogonal to the rendering pipeline.

        // An event handler for window.onResize.
        this._resizeListener = () => {
            if (this._resizeCanvas()) {
                this._draw();
            }
        };

        // The interval ID used while keys are pressed.
        // This is set when the user presses a key when none had been pressed
        // (see _handleKeyDown)
        // and unset when the user releases the last key
        // (see _handleKeyUp).
        this._keyInterval = null;

        // Two functions are memoized for scrolling performance.
        // These maps are used to cache the results,
        // and are invalidated on every prop change for simplicity.
        this._fastFindChordRootOffsetMemo = new Map();
        this._fastPositionToPitchesMemo = new Map();
    }

    componentWillReceiveProps() {
        // Some prop changes can invalidate these caches.
        // We just clear them always for simplicity.
        this._fastFindChordRootOffsetMemo.clear();  // <= rationalizer
        this._fastPositionToPitchesMemo.clear();    // <= treeNumber, rootBass
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
            //
            onMouseDown={this._handleMouseDown.bind(this)}
            onMouseMove={this._handleMouseMove.bind(this)}
            onWheel={this._handleMouseWheel.bind(this)}
            onMouseUp={this._handleMouseUp.bind(this)}
            onMouseLeave={this._handleMouseLeave.bind(this)}
            //
            onKeyDown={this._handleKeyDown.bind(this)}
            onKeyUp={this._handleKeyUp.bind(this)}
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
        this._resizeCanvas();
        this._draw();
        window.addEventListener('resize', this._resizeListener);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._resizeListener);
    }

    componentDidUpdate() {
        this._resizeCanvas();
        this._draw();
    }

    _resizeCanvas() {
        const {canvas} = this.refs;
        const widthString = window.getComputedStyle(canvas).width;
        const width = parseInt(widthString.match(/(\d+)px/)[1], 10);
        if (width !== canvas.width) {
            canvas.width = width;
            return true;
        } else {
            return false;
        }
    }

    _handleMouseDown(e) {
        this.setState({
            ...this.state,
            lastMouse: this._getRelativeMousePosition(e),
        });
    }

    _handleMouseMove(e) {
        if (this.state.lastMouse) {
            const newMouse = this._getRelativeMousePosition(e);
            const oldMouse = this.state.lastMouse;
            const deltaX = -(newMouse.x - oldMouse.x);
            const deltaY = -(newMouse.y - oldMouse.y);
            const finalPosition = this._pan({x: deltaX, y: deltaY});
            this.setState({
                ...this.state,
                position: finalPosition,
                lastMouse: newMouse,
            });
        }
    }

    _handleMouseWheel(e) {
        // Don't be annoying and grab all the things above yourself!
        if (document.activeElement !== e.target) {
            return;
        }
        e.preventDefault();

        const finalPosition = this._pan({x: e.deltaX, y: e.deltaY});
        this.setState({
            ...this.state,
            position: finalPosition,
        });
    }

    _handleMouseUp() {
        this._stopDrag();
    }

    _handleMouseLeave() {
        this._stopDrag();
    }

    _stopDrag() {
        this.setState({
            ...this.state,
            lastMouse: null,
        });
    }

    /*
     * Given a MouseEvent (or SyntheticMouseEvent) object,
     * determine the canvas coordinates of the mouse pointer
     * (assuming the event target is in fact the canvas).
     */
    _getRelativeMousePosition(e) {
        const {left: baseX, top: baseY} = e.target.getBoundingClientRect();
        return {
            x: e.clientX - baseX,
            y: e.clientY - baseY,
        };
    }

    _handleKeyDown(e) {
        if (this._getMotionDirection(e.which) === null) {
            return;
        }
        if (e.repeat) {
            return;
        }
        if (this.state.keysDown.indexOf(e.which) !== -1) {
            // This can happen if you press the key,
            // then click and maybe drag a bit while still holding the key,
            // then release the mouse while holding the key.
            return;
        }
        this.setState({
            ...this.state,
            keysDown: [...this.state.keysDown, e.which],
        }, () => {
            if (this._keyInterval === null) {
                this._keyInterval = window.setInterval(() => {
                    if (this.state.lastMouse) {
                        return;
                    }
                    const keys = this.state.keysDown;
                    const deltas = keys.map(k => this._getMotionDirection(k));
                    const sumDelta = deltas.reduce(
                        (acc, d) => ({x: acc.x + d.x, y: acc.y + d.y}),
                        {x: 0, y: 0});
                    const clampedDelta = {
                        x: Math.sign(sumDelta.x),
                        y: Math.sign(sumDelta.y),
                    };
                    const slowness = 90;  // frames to traverse full canvas
                    const velocityX = this.refs.canvas.width / slowness;
                    const velocityY = this.refs.canvas.height / slowness;
                    const finalDeltas = {
                        x: velocityX * clampedDelta.x,
                        y: velocityY * clampedDelta.y,
                    };
                    const finalPosition = this._pan(finalDeltas);
                    this.setState({...this.state, position: finalPosition});
                }, 1000 / 60);
            }
        });
    }

    _handleKeyUp(e) {
        const keysDown = this.state.keysDown.filter(x => x !== e.which);
        this.setState({
            ...this.state,
            keysDown,
        });
        if (!keysDown.length) {
            window.clearInterval(this._keyInterval);
            this._keyInterval = null;
        }
    }

    /*
     * Given a numeric key code,
     * determine whether the associated key represents a movement action.
     *
     * If it does, return an object with shape { x: number, y: number },
     * where each number is either -1, 0, or +1
     * and indicates the presence and direction of movement along an axis.
     *
     * If it doesn't, return null.
     */
    _getMotionDirection(which) {
        switch (which) {
            case 0x41:  // A
            case 0x25:  // Left
                return { x: -1, y: 0 };
            case 0x57:  // W
            case 0x26:  // Up
                return { x: 0, y: -1 };
            case 0x44:  // D
            case 0x27:  // Right
                return { x: +1, y: 0 };
            case 0x53:  // S
            case 0x28:  // Down
                return { x: 0, y: +1 };
            default:
                return null;
        }
    }

    _getMaxSafeRow() {
        // We use some exponential factors 2^row when rendering,
        // and bizarre things start happening at really high rows.
        // This seems to happen when we approach Number.MAX_SAFE_INTEGER,
        // so we stop just a few before there,
        // where (empirically) the effects become observable.
        const bits = Math.floor(Math.log2(Number.MAX_SAFE_INTEGER));
        return bits - 2;
    }

    /*
     * Given a starting point and a displacement, get the new position.
     *
     * The argument should have shape { x: number, y: number },
     * and should indicate the desired vector displacement across the canvas,
     * in canvas coordinates.
     *
     * The return value is the new value for 'this.state.position'.
     */
    _pan(canvasDeltaXY) {
        const {width: rowWidth, height: rowHeight} = this._getRowDimensions();

        const maxLevel = this._getMaxSafeRow();

        const newY = this.state.position.y + canvasDeltaXY.y / rowHeight;
        const minY = 0;
        const maxY = maxLevel - this.props.viewOptions.infiniteLevels;
        const maxYPadding = 2;  // don't chop off the bottom nodes
        const finalY = Math.max(minY, Math.min(newY, maxY + maxYPadding));

        const scalingFactor = this._getScalingFactor(finalY);

        const perceivedWidth = rowWidth * scalingFactor;
        const newX = this.state.position.x + canvasDeltaXY.x / perceivedWidth;
        const rangeX = 1 - 1 / scalingFactor;
        const minX = -rangeX / 2;
        const maxX = +rangeX / 2;
        const finalX = Math.max(minX, Math.min(newX, maxX));

        return { x: finalX, y: finalY };
    }

    /*
     * Get the dimensions of any (every) row, in canvas coordinates.
     * Return value has shape { width: number, height: number }.
     *
     * The width of each row is just the width of the canvas,
     * and the height is determined from the `levels` prop
     * (which specifies the number of levels to display at any given time)
     * and the height of the canvas.
     *
     * WARNING: This function relies on refs. Do not call it from 'render'.
     */
    _getRowDimensions() {
        return {
            width: this.refs.canvas.width,
            height: this.props.viewOptions.infiniteHeight /
                this.props.viewOptions.infiniteLevels,
        };
    }

    /*
     * Determine the horizontal scaling factor that should be used
     * when the top of the viewport is at the given y-position.
     *
     * This is the scaling-apart factor for the nodes,
     * and also the compression factor for the viewport;
     * for example, if the value is 3,
     * that indicates that the nodes should be spaced 3 times further apart,
     * and also that the viewport should be a third of its original size.
     */
    _getScalingFactor(y) {
        return Math.pow(2, y);
    }

    _draw() {
        const {canvas} = this.refs;
        const {width, height} = canvas;
        const ctx = canvas.getContext('2d', {alpha: 'false'});
        ctx.clearRect(0, 0, width, height);

        const {width: rowWidth, height: rowHeight} = this._getRowDimensions();
        const scalingFactor = this._getScalingFactor(this.state.position.y);

        // Viewport dimensions and position, in absolute coordinates.
        const viewportWidth = rowWidth / scalingFactor;
        const viewportXc = this.state.position.x * width + rowWidth / 2;
        const viewportXl = viewportXc - viewportWidth / 2;
        const viewportXr = viewportXc + viewportWidth / 2;

        // The y-position of the top of the top row, in absolute coordinates.
        const topY = rowHeight * (this.state.position.y - 0.5);
        const rowMin = Math.ceil(topY / rowHeight);
        const rowMax = Math.min(
            this._getMaxSafeRow(),
            Math.floor((topY + height) / rowHeight));

        // Paint one extra row above so that things move into view smoothly.
        // We don't need to paint a row below
        // because everything has top-gravity.
        for (let row = Math.max(0, rowMin - 1); row <= rowMax; row++) {
            const absoluteYc = rowHeight * (row + 0.5);
            const canvasYc = absoluteYc - this.state.position.y * rowHeight;

            // We only have to paint the nodes that are in view.
            // Determine these bounds.
            const nodes = Math.pow(2, row);
            const colMin = Math.ceil(nodes * viewportXl / rowWidth - 0.5);
            const colMax = Math.floor(nodes * viewportXr / rowWidth - 0.5);

            // Similarly, paint one extra column in each direction.
            for (let col = Math.max(0, colMin - 1);
                    col <= Math.min(nodes - 1, colMax + 1);
                    col++) {
                // We find the offset from the viewport center (OFVC)
                // in absolute coordinates,
                // then convert that to canvas coordinates.
                const absoluteXc = rowWidth * (col + 0.5) / nodes;
                const absoluteOFVC = absoluteXc - viewportXc;
                const canvasOFVC = absoluteOFVC * (rowWidth / viewportWidth);
                const canvasXc = rowWidth / 2 + canvasOFVC;
                this._drawNode(ctx, row, col, canvasXc, canvasYc);
            }
        }
    }

    _drawNode(ctx, row, col, x, y) {
        const {viewOptions} = this.props;
        const notes = this._fastPositionToPitches(row, col);
        const visible = withinLimits(notes, this.props.viewOptions.limits);
        const {noteNames, semitoneNames} = formatPitchesAndSemitones(
            notes, viewOptions);

        const scale = 0.5 + 0.5 *
            Math.sqrt(Math.max(0, 1 - y / ctx.canvas.height));

        const fontSize = Math.round(14 * scale);
        const lineHeight = Math.round(1.2 * fontSize);
        const padding = 5;
        const fontFamily = '"Helvetica Neue",Helvetica,Arial,sans-serif';
        ctx.font = `${fontSize}px ${fontFamily}`;  // for metrics

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

        // Profiling indicates that measureText is a bottleneck,
        // so this is a little heuristic to avoid calls...
        const lineWidth = line => !line ? 0 :
            line.text.length * (line.root ? 1.5 : 1);
        const longestLine = ctx.measureText(lines.reduce((best, line) =>
            lineWidth(line) > lineWidth(best) ? line : best).text).width;

        const width = longestLine + 2 * padding;
        const height = lineHeight * lines.length + 2 * padding;

        // HSV is great! But we have to use HSL :(
        const satHSV = 0.1;
        const baseLight = 0.5 * (2 - satHSV);
        const light = visible ? baseLight : baseLight * 0.2 + 0.8;
        const sat = satHSV / (1 - Math.abs(2 * light - 1));
        const hslString = (h, s, l) =>
            `hsl(${h * 360}, ${s * 100}%, ${l * 100}%)`;
        ctx.fillStyle = hslString(row / 16, sat, light);
        ctx.strokeStyle = hslString(row / 16, sat, visible ? 0.25 : 0.8);

        ctx.lineWidth = 1;
        ctx.beginPath();
        this._roundRect(ctx,
            Math.round(x - width / 2),
            Math.round(y),
            Math.round(width),
            Math.round(height),
            padding);
        ctx.stroke();
        ctx.fill();

        // Finally, paint the text!
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

}
InfiniteCanvas.propTypes = {
    viewOptions: CustomPropTypes.viewOptions.isRequired,
    rationalizer: PropTypes.func.isRequired,
};
