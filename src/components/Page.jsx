import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

export default class Page extends Component {
    render() {
        const NavEntry = ({ path, name, flag }) =>
            <li className={path === this.props.path ? "active" : undefined}>
                <Link to={`/${path}`}>
                    {name}
                    {flag && <span style={{
                        color: "red",
                        fontSize: "75%",
                    }}>
                        {"\u2002"}
                        {flag.toString().toUpperCase()}
                    </span>}
                </Link>
            </li>;
        NavEntry.propTypes = {
            path: PropTypes.string.isRequired,
            name: PropTypes.node.isRequired,
            flag: PropTypes.string,
        };
        return <div>
            <nav className="navbar navbar-inverse navbar-static-top">
                <div className="container">
                    <span className="navbar-brand">Var&egrave;se tools</span>
                    <div className="collapse navbar-collapse">
                        <ul className="nav navbar-nav">
                            {this.props.links.map((props, idx) =>
                                <NavEntry {...props} key={idx} />)}
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
    //
    links: PropTypes.arrayOf(PropTypes.shape({
        path: PropTypes.string.isRequired,
        name: PropTypes.node.isRequired,
        flag: PropTypes.string,
    }).isRequired),
};
Page.defaultProps = {
    links: [
        { path: "calculator", name: "Root calculator" },
        { path: "tree", name: "Tree explorer" },
        { path: "infinite-tree", name: "Infinite tree", flag: "beta" },
    ],
};
