import React, {Component} from 'react';

export default class InfiniteCanvas extends Component {

    render() {
        return <canvas
            ref="canvas"
            width={720}
            height={600}
            style={{ outline: "thin red solid", width: "100%", height: 600 }}
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

    _draw() {
        const {canvas} = this.refs;
        const {width, height} = canvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        const startLevel = 1;
        const levels = 4;

        const nodeRadius = 5;
        for (let row = 0; row < levels; row++) {
            const level = row + startLevel;
            const nodes = Math.pow(2, level);
            const centerY = height * (row + 0.5) / levels;
            for (let i = 0; i < nodes; i++) {
                const centerX = width * (i + 0.5) / nodes;
                ctx.beginPath();
                ctx.arc(centerX, centerY, nodeRadius, 0, Math.PI * 2);
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
                console.log("New size!");
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
