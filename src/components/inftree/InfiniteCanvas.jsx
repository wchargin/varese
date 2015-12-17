import React, {Component} from 'react';

const canvasHeight = 600;
const levelsShown = 5;
const levelSpacing = canvasHeight / levelsShown;
const maxLevels = 8;

export default class InfiniteCanvas extends Component {

    constructor() {
        super();
        this.state = {
            position: {
                x: 0,
                y: 0,
            },
            dragState: {
                dragging: false,
                originalPosition: null,
                initialMousePosition: null,
            },
        };
    }

    render() {
        return <canvas
            ref="canvas"
            width={720}
            height={canvasHeight}
            style={{
                outline: "thin red solid",
                width: "100%",
                height: canvasHeight,
            }}
            //
            onMouseDown={this._handleMouseDown.bind(this)}
            onMouseUp={this._handleMouseUp.bind(this)}
            onMouseMove={this._handleMouseMove.bind(this)}
            onMouseLeave={this._handleMouseLeave.bind(this)}
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

    _getRelativeMousePosition(e) {
        const {left: baseX, top: baseY} = e.target.getBoundingClientRect();
        return {
            x: e.clientX - baseX,
            y: e.clientY - baseY,
        };
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

    _handleMouseUp() {
        this.setState({
            ...this.state,
            dragState: {
                dragging: false,
                originalPosition: null,
                initialMousePosition: null,
            },
        });
    }

    _handleMouseMove(e) {
        const {dragState} = this.state;
        if (dragState.dragging) {
            const newMouse = this._getRelativeMousePosition(e);
            const oldMouse = dragState.initialMousePosition;
            const deltaX = newMouse.x - oldMouse.x;
            const deltaY = newMouse.y - oldMouse.y;

            const newY = dragState.originalPosition.y + deltaY;
            const minY = -levelSpacing * maxLevels;
            const newClampedY = Math.max(Math.min(0, newY), minY);
            const newClampedDeltaY = newClampedY - dragState.originalPosition.y;

            const newX = dragState.originalPosition.x + deltaX;
            const newRecenteredX = newX *
                Math.pow(2, -newClampedDeltaY / levelSpacing);

            const finalPosition = { x: newRecenteredX, y: newClampedY };

            this.setState({
                ...this.state,
                position: finalPosition,
            });
        }
    }

    _handleMouseLeave() {
        this._handleMouseUp();
    }

    _draw() {
        const {canvas} = this.refs;
        const {width, height} = canvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        const {x: offsetX, y: offsetY} = this.state.position;

        const levelOffset = -offsetY / levelSpacing;
        const startLevel = Math.max(0, Math.floor(levelOffset));

        // Draw all the rows that are definitely in view,
        // plus one more so that it scrolls into view properly
        // without suddenly appearing.
        for (let row = 0; row < levelsShown + 1; row++) {
            const level = row + startLevel;
            const nodes = Math.pow(2, level);
            const centerY = levelSpacing * (row + 0.5);
            for (let i = 0; i < nodes; i++) {
                const centerX = (width / 2) - Math.pow(2, levelOffset) *
                    ((width / 2) - (width * (i + 0.5) / nodes));
                const nodeRadius = 5;
                ctx.beginPath();
                ctx.arc(centerX + offsetX, centerY + offsetY % levelSpacing,
                    nodeRadius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 0, 0, ${Math.pow(0.8, level)})`;
                ctx.fill();
            }
        }
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

}
