import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

export default class Page extends Component {
    render() {
        const link = (name, text) =>
            <li className={name === this.props.path ? "active" : undefined}>
                <Link to={`/${name}`}>{text}</Link>
            </li>;
        return <div>
            <nav className="navbar navbar-inverse navbar-static-top">
                <div className="container">
                    <span className="navbar-brand">Var&egrave;se tools</span>
                    <div className="collapse navbar-collapse">
                        <ul className="nav navbar-nav">
                            {link("calculator", "Pitch calculator")}
                            {link("tree", "Tree explorer")}
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="container">{this.props.children}</div>
        </div>;
    }
}
Page.propTypes = {
    path: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
}
