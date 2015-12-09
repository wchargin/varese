import React, {Component} from 'react';

import Page from './../Page';
import TrichordView from './TrichordView';

export default class App extends Component {
    render() {
        return <Page path="tree">
            <h1>Coming soon!</h1>
            <TrichordView notes={[0,4,7]} />
        </Page>;
    }
}
