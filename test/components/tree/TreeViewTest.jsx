import {describe, it} from 'mocha';
import {expect} from 'chai';

import React from 'react';

import {
    renderIntoDocument,
    scryManyWithTag,
    scryManyWithClass,
} from '../../TestUtils';

import TreeView from '../../../src/components/tree/TreeView';

describe('TreeView', () => {
    // eslint-disable-next-line react/prop-types
    const TreeElement = ({ name }) => <i className="tree-element">{name}</i>;
    const treeElements = [
        [
            <TreeElement name="1" />,
        ],
        [
            <TreeElement name="2" />,
            <TreeElement name="3" />,
        ],
        [
            <TreeElement name="4" />,
            <TreeElement name="5" />,
            <TreeElement name="6" />,
            <TreeElement name="7" />,
        ],
    ];

    it("renders all the elements", () => {
        const component = renderIntoDocument(<TreeView
            elements={treeElements}
        />);
        expect(scryManyWithClass(component, "tree-element")).to.have.length(7);
    });

    it("renders in the right number of rows", () => {
        const component = renderIntoDocument(<TreeView
            elements={treeElements}
        />);
        const rows = scryManyWithTag(component, 'div')
            .filter(x => x.style.display === 'table-row');
        expect(rows).to.have.length(treeElements.length);
    });

});
