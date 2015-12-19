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
 *     The scaling factor is the same as the absolute coordinates.
 */
import React, {Component, PropTypes} from 'react';

import {positionToSemitones} from '../../TreeSpace';

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
            dragState: {
                dragging: false,
                originalPosition: null,     // idealized coordinates
                initialMousePosition: null, // canvas coordinates
            },
            keysDown: [],  // a list of numeric key codes
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
    }

    render() {
        return <canvas
            ref="canvas"
            width={720}
            height={this.props.height}
            style={{
                outline: "thin red solid",
                width: "100%",
                height: this.props.height,
            }}
            //
            onMouseDown={this._handleMouseDown.bind(this)}
            onMouseMove={this._handleMouseMove.bind(this)}
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
            dragState: {
                dragging: true,
                originalPosition: this.state.position,
                initialMousePosition: this._getRelativeMousePosition(e),
            },
        });
    }

    _handleMouseMove(e) {
        const {dragState} = this.state;
        if (dragState.dragging) {
            const newMouse = this._getRelativeMousePosition(e);
            const oldMouse = dragState.initialMousePosition;
            const deltaX = -(newMouse.x - oldMouse.x);
            const deltaY = -(newMouse.y - oldMouse.y);

            this._pan(dragState.originalPosition, {x: deltaX, y: deltaY});
        }
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
            dragState: {
                dragging: false,
                originalPosition: null,
                initialMousePosition: null,
            },
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
                    if (this.state.dragState.dragging) {
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
                    this._pan(this.state.position, finalDeltas);
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

    /*
     * Given a starting point and a displacement, move the viewport.
     *
     * Both arguments should have shape { x: number, y: number }.
     * The first is in idealized coordinates,
     * and should be the value of 'this.state.position' before the pan.
     * The second is in canvas coordinates,
     * and indicates the desired vector displacement across the canvas.
     */
    _pan(originalPosition, canvasDeltaXY) {
        const {width: rowWidth, height: rowHeight} = this._getRowDimensions();

        // We use some exponential factors 2^row when rendering,
        // and bizarre things start happening at really high rows.
        // This seems to happen when we pass Number.MAX_SAFE_INTEGER,
        // so we'll clamp it there and see what happens!
        const maxLevel = Math.log2(Number.MAX_SAFE_INTEGER);

        const newY = originalPosition.y + canvasDeltaXY.y;
        const minY = 0;
        const maxY = (maxLevel - this.props.levels) * rowHeight;
        const finalY = Math.max(minY, Math.min(newY, maxY));

        const scalingFactor = this._getScalingFactor(finalY);

        const newX = originalPosition.x + canvasDeltaXY.x / scalingFactor;
        const viewportWidth = rowWidth / scalingFactor;
        const rangeX = rowWidth - viewportWidth;
        const minX = -rangeX / 2;
        const maxX = +rangeX / 2;
        const finalX = Math.max(minX, Math.min(newX, maxX));

        const finalPosition = { x: finalX, y: finalY };
        this.setState({ ...this.state, position: finalPosition });
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
            height: this.props.height / this.props.levels,
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
        return Math.pow(2, y / this._getRowDimensions().height);
    }

    _draw() {
        const {canvas} = this.refs;
        const {width, height} = canvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        const {width: rowWidth, height: rowHeight} = this._getRowDimensions();
        const scalingFactor = this._getScalingFactor(this.state.position.y);

        // Viewport dimensions and position, in absolute coordinates.
        const viewportWidth = rowWidth / scalingFactor;
        const viewportXc = this.state.position.x + rowWidth / 2;
        const viewportXl = viewportXc - viewportWidth / 2;
        const viewportXr = viewportXc + viewportWidth / 2;

        // The y-position of the top of the top row, in absolute coordinates.
        const topY = this.state.position.y - rowHeight / 2;
        const rowMin = Math.ceil(topY / rowHeight);
        const rowMax = Math.floor((topY + height) / rowHeight);

        // Paint one extra row in each direction
        // so that things move into view smoothly.
        for (let row = Math.max(0, rowMin - 1); row <= rowMax + 1; row++) {
            const absoluteYc = rowHeight * (row + 0.5);
            const canvasYc = absoluteYc - this.state.position.y;

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
        // TODO(william): fix dummy values
        const tree = 1;
        const semitones = positionToSemitones(tree, row, col);
        const semitoneNames = semitones.map(x => `[${x}]`);
        const noteNames = ["C4", "E4", "G4"];
        const scale = 0.5 + 0.5 *
            Math.sqrt(Math.max(0, 1 - y / ctx.canvas.height));

        const fontSize = 14 * scale;
        const lineHeight = 1.2 * fontSize;
        const padding = 5;
        const fontFamily = '"Helvetica Neue",Helvetica,Arial,sans-serif';

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = 'black';

        // Here's our little state schema that we'll keep track of.
        const initialState = {
            lastBaseline: y + padding,
        };

        // Define a few reusable action creators
        // whose return values are actions of type State -> IO State...
        const advanceBaseline = delta => state => ({
            ...state,
            lastBaseline: state.lastBaseline + delta,
        });
        const writeLines = texts => state => texts.reduce((state, text) => {
            const newState = advanceBaseline(lineHeight)(state);
            const metrics = ctx.measureText(text);
            const tx = x - metrics.width / 2;
            ctx.fillText(text, tx, newState.lastBaseline);
            return newState;
        }, state);

        // ...then sequence a bunch of them together!
        const actions = [
            writeLines(noteNames.slice().reverse()),
            advanceBaseline(lineHeight / 2),
            writeLines(semitoneNames.slice().reverse()),
        ];
        const finalState = actions.reduce(
            (state, action) => action(state), initialState);

        const width = 75 * scale;
        const height = (finalState.lastBaseline + padding) - y;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(x - width / 2, y, width, height);
        ctx.stroke();

        const radius = 5;
        const hue = (row % 16) / 16 * 360;
        const alpha = Math.pow(0.75, row / 16);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
        ctx.strokeStyle = `hsla(${hue}, 100%, 40%, 1)`;
        ctx.fill();
        ctx.stroke();
    }

}
InfiniteCanvas.propTypes = {
    height: PropTypes.number,
    levels: PropTypes.number,
};
InfiniteCanvas.defaultProps = {
    height: 600,
    levels: 5,
};
