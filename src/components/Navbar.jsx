import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

export default class Navbar extends Component {
    render() {
        const link = (name, text) =>
            <li className={name === this.props.here ? "active" : undefined}>
                <Link to={`/${name}`}>{text}</Link>
            </li>;
        return <nav className="navbar navbar-inverse navbar-static-top">
            <div className="container">
                <span className="navbar-brand">Var&egrave;se tools</span>
                <div className="collapse navbar-collapse">
                    <ul className="nav navbar-nav">
                        {link("calculator", "Pitch calculator")}
                        {link("tree", "Tree explorer")}
                    </ul>
                </div>
            </div>
        </nav>;
    }
}
Navbar.propTypes = {
    here: PropTypes.string.isRequired,
}
