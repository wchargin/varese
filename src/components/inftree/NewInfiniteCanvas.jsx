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
 */
import React, {Component} from 'react';

export default class NewInfiniteCanvas extends Component {

    constructor() {
        super();
        this.state = { };
    }

    render() {
        return <canvas
            ref="canvas"
            width={720}
            height={600}
            style={{
                outline: "thin red solid",
                width: "100%",
                height: 600,
            }}
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

        this._resizeListener = () => {
            if (this._resizeCanvas()) {
                this._draw();
            }
        };
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

    _draw() {
        const {canvas} = this.refs;
        const {width, height} = canvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        ctx.fillRect(10, 10, 20, 20);
    }

}
