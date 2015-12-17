import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

export default class Page extends Component {
    render() {
        const link = (name, text, flag) =>
            <li className={name === this.props.path ? "active" : undefined}>
                <Link to={`/${name}`}>
                    {text}
                    {flag && <span style={{
                        color: "red",
                        fontSize: "75%",
                    }}>
                        {"\u2002"}
                        {flag.toString().toUpperCase()}
                    </span>}
                </Link>
            </li>;
        return <div>
            <nav className="navbar navbar-inverse navbar-static-top">
                <div className="container">
                    <span className="navbar-brand">Var&egrave;se tools</span>
                    <div className="collapse navbar-collapse">
                        <ul className="nav navbar-nav">
                            {link("calculator", "Root calculator")}
                            {link("tree", "Tree explorer")}
                            {/* global __PROD__ */ !__PROD__ && link(
                                "infinite-tree", "Infinite tree", "alpha")}
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
};
