/*
 * The idea for the approach is as follows.
 * The tree is a static vertical column.
 * As you move downward, your view narrows.
 * Define a coordinate system pointing
 * downward vertically and outward horizontally.
 * If the bottom of your viewport is at position $y' = y + h$,
 * then the scaling factor should be $s_x = 2^((y' - h) / H)$,
 * where $H$ is the height of a row.
 *
 * The total perceived width of the viewport is then $v_w = W / s_x$,
 * where $W$ is the total width,
 * so the range of allowable values for $x$ must be $W - v_w$.
 * Thus the absolute value of $x$ must be no more than $W - v_w / 2$,
 * so we must have $-(W - v_w / 2) / 2 \leq x \leq (W - v_w) / 2$,
 * or, equivalently, $-W(1 - 1 / (2 s_x)) \leq x \leq W(1 - 1 / (2 s_x))$.
 *
 * If position is $(x, y)$, and the viewport width is again $v_w$,
 * so the viewport covers---in actual coordinates---a horizontal range
 * of $x - v_w / 2$ to $x + v_w / 2$.
 *
 * We want to find all the nodes within this viewport;
 * that is, all the nodes with $y$-position in $[y - p_y, y + h - p_y]$, and
 * $x$-position in $[x - v_w - p_w, x + v_w + p_w]$,
 * where $p_x$ and $p_y$ are the horizontal and vertical paddings,
 * determined by half the width and height (respectively) of a node.
 * The minimum row is then row $\lceil (y - p_y) / H \rceil$,
 * while the maximum row is row $\lfloor (y + h + p_y) / H \rfloor$.
 * For each row $r$ within this range,
 * nodes are centered at $(k + 1/2) 2^(-r) W$
 * for each $k \in \{ 0, \dotsc, 2^r - 1 \}$.
 * So a node at actual position $x' = (k + 1/2) 2^(-r) W$
 * has zero-based index $k = 2^r (x' / W) - 1/2$.
 * This is, of course, monotonic, so we care about the nodes
 * from index $\lceil 2^r (x - v_w - p_w) / W - 1/2 \rceil$
 * to index  $\lfloor 2^r (x + v_w + p_w) / W - 1/2 \rfloor$
 * (where we've just substituted the viewport bounds
 * into the position-to-index formula).
 *
 * We thus have something like this for drawing the viewport:
 *
 *     // All units are ``actual'' (canvas) units.
 *     const {x, y} = currentPosition;
 *     const {rowWidth, rowHeight} = eachRowDimensions;
 *
 *     const viewportWidth = rowWidth / Math.pow(2, y / rowHeight);
 *     const halfViewportWidth = viewportWidth / 2;
 *     const viewportMin = x - halfViewportWidth;
 *     const viewportMax = x + halfViewportWidth;
 *
 *     const {paddingX, paddingY} = halfNodeDimensions;
 *
 *     const rowMin = Math.ceil((y - paddingY) / rowHeight)
 *     const rowMax = Math.floor((y + height + paddingY) / rowHeight)
 *     for (let row = rowMin; row <= rowMax; row++) {
 *         const colMin = Math.ceil(
 *             Math.pow(2, row) * (viewportMin - paddingX) / rowWidth - 0.5);
 *         const colMax = Math.floor(
 *             Math.pow(2, row) * (viewportMax + paddingX) / rowWidth - 0.5);
 *         for (let col = colMin; col <= colMax; col++) {
 *             processNode(row, col);
 *         }
 *     }
 *
 * Then there's the issue of navigation.
 * When you pan straight down, you can just go straight down,
 * because our scale is linear in the vertical.
 * But that's not quite true when you drag horizontally.
 * You want to *feel* like you're dragging linearly;
 * in particular, you want a point under your mouse to stay under your mouse.
 *
 * So if the viewport is width $v_w = W / 2^(y / H)$
 * and you pan by some $x$ pixels *in viewport units*,
 * your actual position should change by $x / v_w$.
 * Happily, that's a reasonably simple calculation to make!
 *
 *
 * COORDINATE SYSTEMS
 * ------------------
 *
 * There are three coordinate systems in use.
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
 */
import React, {Component, PropTypes} from 'react';
import CustomPropTypes from '../CustomPropTypes';

import {findChordRootOffset} from '../../HarmonicSeries';
import {positionToPitches} from '../../TreeSpace';
import {pitchToName} from '../../PitchNames';
import {withinLimits} from '../../DisplayUtils';

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

        this._fastFindChordRootOffsetMemo = new Map();
        this._fastPositionToPitchesMemo = new Map();
    }

    componentWillReceiveProps() {
        this._fastFindChordRootOffsetMemo.clear();
        this._fastPositionToPitchesMemo.clear();
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
            height={this.props.height}
            style={{
                boxShadow: '0 0 2px 1px rgba(0, 0, 0, 0.2)',
                borderRadius: 2,
                width: "100%",
                height: this.props.height,
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
        const maxY = (maxLevel - this.props.viewOptions.infiniteLevels) *
            rowHeight;
        const maxYPadding = 2 * rowHeight;  // don't chop off the bottom nodes
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
            height: this.props.height / this.props.viewOptions.infiniteLevels,
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
        const notes = this._fastPositionToPitches(row, col);
        const noteNames = notes.map(x => pitchToName(
            x, true, this.props.viewOptions.showOctaves));
        const visible = withinLimits(notes, this.props.viewOptions.limits);

        const [low, mid, high] = notes;
        const semitones = [mid - low, high - mid];
        const semitoneNames = semitones.map(x => `[${x}]`);

        const scale = 0.5 + 0.5 *
            Math.sqrt(Math.max(0, 1 - y / ctx.canvas.height));

        const fontSize = Math.round(14 * scale);
        const lineHeight = 1.2 * fontSize;
        const padding = 5;
        const fontFamily = '"Helvetica Neue",Helvetica,Arial,sans-serif';
        ctx.font = `${fontSize}px ${fontFamily}`;  // for metrics

        const getRoot = () => {
            const maybeRootPitch = this._fastFindChordRootOffset(notes);
            if (maybeRootPitch.status === "success") {
                const rootPitch = maybeRootPitch.result;
                const rootName = pitchToName(rootPitch, true,
                    this.props.viewOptions.showOctaves);
                return rootName;
            } else {
                const e = maybeRootPitch.error;
                if (e.match(/finite/) || e.match(/zero_ratio/)) {
                    return "?";
                } else {
                    throw e;
                }
            }
        };
        const lines = [
            ...noteNames.slice().reverse().map(x => ({text: x})),
            ...(this.props.viewOptions.showRoots ?
                [{text: getRoot(), root: true}] :
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
        this._roundRect(ctx, x - width / 2, y, width, height, padding);
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
            ctx.fillText(data.text + "", x, y + padding + index * lineHeight);
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
    height: PropTypes.number.isRequired,
    viewOptions: CustomPropTypes.viewOptions.isRequired,
    rationalizer: PropTypes.func.isRequired,
};
