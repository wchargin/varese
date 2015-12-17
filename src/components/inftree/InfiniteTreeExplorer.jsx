import React, {Component} from 'react';

import Page from '../Page';

import InfiniteCanvas from './InfiniteCanvas';

export default class InfiniteTreeExplorer extends Component {
    render() {
        return <Page path="infinite-tree">
            <h1>Infinite chord tree explorer (alpha)</h1>
            <InfiniteCanvas />
        </Page>;
    }
}
