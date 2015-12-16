import React, {Component} from 'react';

export default class InfiniteCanvas extends Component {

    render() {
        return <canvas ref="canvas">
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
        const {canvas} = this.refs;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillRect(0, Math.random() * 100, 75, 3);
        ctx.font = "12px sans";
        ctx.fillText("Hello, world!", 0, 14);
    }

    componentDidUpdate() {
        this.componentDidMount();
    }

}
