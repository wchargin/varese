import {describe, describe as context, it} from 'mocha';
import {expect} from 'chai';

import React from 'react';

import {
    Simulate,
    renderIntoDocument,
    scryManyWithClass,
    findOneWithTag,
    scryManyWithTag,
    scryManyWithType,
    makeBox,
} from '../../TestUtils';
import {initialState, canonicalRationalizer} from '../../TestData';

import TrichordTree from '../../../src/components/tree/TrichordTree';
import TrichordView from '../../../src/components/tree/TrichordView';

describe('TrichordTree', () => {
    const baseViewOptions = {
        ...initialState.treeViewOptions,
        levels: 2,
    };
    const baseProps = {
        rationalizer: canonicalRationalizer,
        rootChord: [0, 4, 7],
        onClickChord: () => {},
        viewOptions: baseViewOptions,
    };

    const getViews = component => scryManyWithType(component, TrichordView);

    it("renders a tree with three rows, yielding seven nodes", () => {
        const component = renderIntoDocument(<TrichordTree
            {...baseProps}
            viewOptions={{
                ...baseViewOptions,
                levels: 3,
            }}
        />);
        expect(getViews(component)).to.have.length(7);
    });

    it("uses the right values for the views", () => {
        const component = renderIntoDocument(<TrichordTree
            {...baseProps}
            viewOptions={{
                ...baseViewOptions,
                levels: 3,
            }}
        />);
        const views = getViews(component);
        const expectedNotes = [
            [0, 4, 7],      // 0
            [-4, 0, 7],     // L
            [0, 7, 10],     // R
            [-8, -4, 7],    // LL
            [-4, 7, 14],    // LR
            [-7, 0, 10],    // RL
            [0, 10, 13],    // RR
        ];
        views.forEach((view, index) =>
            expect(view.props.notes).to.deep.equal(expectedNotes[index]));
    });

    it("renders an inline (non-wide) div when specified", () => {
        const component = renderIntoDocument(<TrichordTree
            {...baseProps}
            viewOptions={{
                ...baseViewOptions,
                wide: false,
            }}
        />);
        expect(scryManyWithClass(component, 'wide-tree')).to.have.length(0);
    });

    it("renders a wide div when specified", () => {
        const component = renderIntoDocument(<TrichordTree
            {...baseProps}
            viewOptions={{
                ...baseViewOptions,
                wide: true,
            }}
        />);
        expect(scryManyWithClass(component, 'wide-tree')).to.have.length(1);
    });

    context("regarding sizes", () => {
        const test = ({ rows, rowsName, size, sizeName }) => {
            const render = () => renderIntoDocument(<TrichordTree
                {...baseProps}
                viewOptions={{
                    ...baseViewOptions,
                    levels: rows,
                }}
            />);
            context(`when there are ${rowsName} rows showing`, () => {
                it("renders the root as large", () =>
                    expect(getViews(render())[0].props).to.have.property(
                        'size', 3));
                it(`renders other nodes as ${sizeName}`, () =>
                    getViews(render()).slice(1).forEach(node =>
                        expect(node.props).to.have.property('size', size)));
            });
        };
        test({ rows: 4, rowsName: "four", size: 3, sizeName: "large"  });
        test({ rows: 5, rowsName: "five", size: 2, sizeName: "medium" });
        test({ rows: 6, rowsName: "six",  size: 1, sizeName: "small"  });
    });

    context("regarding click and change handlers", () => {
        it("uses a working change handler for the root", () => {
            const {getBox, setBox} = makeBox();
            const component = renderIntoDocument(<TrichordTree
                {...baseProps}
                onClickChord={setBox}
            />);
            const root = getViews(component)[0];
            expect(root.props.onChange).to.be.a('function');
            expect(root.props.onClick).to.not.be.a('function');
            //
            const topNoteInput = scryManyWithTag(root, 'input')[0];
            Simulate.change(topNoteInput, { target: { value: 'G5' } });
            expect(getBox()).to.deep.equal([0, 4, 19]);
        });
        it("uses a working click handler for everything but the root", () => {
            const {getBox, setBox} = makeBox();
            const component = renderIntoDocument(<TrichordTree
                {...baseProps}
                onClickChord={setBox}
            />);
            const nonRoots = getViews(component).slice(1);
            nonRoots.forEach(node => {
                expect(node.props.onChange).to.not.be.a('function');
                expect(node.props.onClick).to.be.a('function');
                const notesHere = node.props.notes;
                Simulate.click(findOneWithTag(node, 'button'));
                expect(getBox()).to.deep.equal(notesHere);
            });
        });
    });

});
