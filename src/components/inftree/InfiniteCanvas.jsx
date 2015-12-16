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
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillRect(0, 16, 75, 2);
        ctx.font = "12px sans";
        ctx.fillText("Hello, world!", 0, 14);
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
