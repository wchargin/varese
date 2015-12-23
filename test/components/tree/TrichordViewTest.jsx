import {describe, describe as context, it} from 'mocha';
import {expect} from 'chai';

import React from 'react';
import {
    Simulate,
    renderIntoDocument,
    findRenderedDOMComponentWithTag as findOneWithTag,
    scryRenderedDOMComponentsWithTag as scryManyWithTag,
} from 'react-addons-test-utils';

import reducer from '../../../src/core/Reducers';
import * as Actions from '../../../src/core/Actions';
import {canonicalRationalizer} from '../../../src/core/HarmonicData';

import TrichordView from '../../../src/components/tree/TrichordView';

describe('TrichordView', () => {

    const baseViewOptions = {
        ...reducer(undefined, Actions.noop()).treeViewOptions,
        showRoots: true,
        showOctaves: true,
    };
    const baseProps = {
        notes: [0, 4, 7],
        rationalizer: canonicalRationalizer,
        viewOptions: baseViewOptions,
        size: 3,
        onClick: undefined,
        onChange: undefined,
    };

    function verifyNodes(nodes, contents, diviner = x => x.textContent) {
        expect(nodes.length).to.equal(contents.length);
        contents.forEach((content, idx) =>
            expect(diviner(nodes[idx])).to.equal(content));
    }

    function makeBox(initialValue = null) {
        let box = initialValue;
        return {
            getBox() {
                return box;
            },
            setBox(value) {
                box = value;
            },
        };
    }

    it("renders a static (non-clickable, non-editable) view", () => {
        const component = renderIntoDocument(<TrichordView
            {...baseProps}
        />);
        const strongs = scryManyWithTag(component, 'strong');
        verifyNodes(strongs, ["G4", "E4", "C4", "C2"]);
    });

    it("renders no buttons in the static view", () => {
        const component = renderIntoDocument(<TrichordView
            {...baseProps}
        />);
        const strongs = scryManyWithTag(component, 'strong');
        verifyNodes(strongs, ["G4", "E4", "C4", "C2"]);
        expect(scryManyWithTag(component, 'button').length).to.equal(0);
    });

    it("respects when showRoots = false", () => {
        const component = renderIntoDocument(<TrichordView
            {...baseProps}
            viewOptions={{
                ...baseViewOptions,
                showRoots: false,
            }}
        />);
        const strongs = scryManyWithTag(component, 'strong');
        verifyNodes(strongs, ["G4", "E4", "C4"]);
    });

    it("respects when showOctaves = false", () => {
        const component = renderIntoDocument(<TrichordView
            {...baseProps}
            viewOptions={{
                ...baseViewOptions,
                showOctaves: false,
            }}
        />);
        const strongs = scryManyWithTag(component, 'strong');
        verifyNodes(strongs, ["G", "E", "C", "C"]);
    });

    it("pretty-prints notes and roots", () => {
        const component = renderIntoDocument(<TrichordView
            {...baseProps}
            notes={[1, 5, 8]  /* C#4, F4, Ab4 */}
        />);
        const strongs = scryManyWithTag(component, 'strong');
        const notes = ["A\u266D4", "F4", "C\u266F4", "C\u266F2"];
        verifyNodes(strongs, notes);
    });

    it("renders a button when the onClick property is given", () => {
        const component = renderIntoDocument(<TrichordView
            {...baseProps}
            onClick={() => {}}
        />);
        expect(scryManyWithTag(component, 'button').length).to.equal(1);
    });

    it("forwards events to the onClick handler", () => {
        const {getBox, setBox} = makeBox(false);
        const component = renderIntoDocument(<TrichordView
            {...baseProps}
            onClick={() => setBox(true)}
        />);
        const button = findOneWithTag(component, 'button');
        expect(getBox()).to.equal(false);
        Simulate.click(button);
        expect(getBox()).to.equal(true);
    });

    it("shows editable text boxes when the onChange property is given", () => {
        const component = renderIntoDocument(<TrichordView
            {...baseProps}
            onChange={() => {}}
        />);
        const textFields = scryManyWithTag(component, 'input')
            .filter(x => x.type === 'text');
        expect(textFields.length).to.equal(3);
        verifyNodes(textFields, ["G4", "E4", "C4"], x => x.value);
    });

    context("'Invert' button", () => {
        const findInvert = component => scryManyWithTag(component, 'button')
            .find(x => x.textContent === "Invert");

        it("appears when 'onChange' is given", () => {
            const component = renderIntoDocument(<TrichordView
                {...baseProps}
                onChange={() => {}}
            />);
            const invertButton = findInvert(component);
            expect(invertButton).to.not.equal(undefined);
            expect(invertButton.disabled).to.equal(false);
        });

        it("passes up the inverted chord on click", () => {
            const {getBox, setBox} = makeBox(null);
            const component = renderIntoDocument(<TrichordView
                {...baseProps}
                onChange={x => setBox(x)}
            />);
            const invertButton = findInvert(component);
            expect(getBox()).to.equal(null);
            Simulate.click(invertButton);
            expect(getBox()).to.deep.equal([0, 3, 7]);  // was [0, 4, 7]
        });

        it("is disabled for the root of a tree", () => {
            const component = renderIntoDocument(<TrichordView
                {...baseProps}
                notes={[0, 2, 4]}
                onChange={() => {}}
            />);
            const invertButton = findInvert(component);
            expect(invertButton).to.not.equal(undefined);
            expect(invertButton.disabled).to.equal(true);
        });

        it("is enabled for a non-root degenerate chord", () => {
            // (a degenerate chord is one where an interval is zero)
            const component = renderIntoDocument(<TrichordView
                {...baseProps}
                notes={[0, 0, 4]}
                onChange={() => {}}
            />);
            const invertButton = findInvert(component);
            expect(invertButton).to.not.equal(undefined);
            expect(invertButton.disabled).to.equal(false);
        });

    });

    context("'Infold' button", () => {
        const findInfold = component => scryManyWithTag(component, 'button')
            .find(x => x.textContent === "Infold");

        it("appears when 'onChange' is given", () => {
            const component = renderIntoDocument(<TrichordView
                {...baseProps}
                onChange={() => {}}
            />);
            const infoldButton = findInfold(component);
            expect(infoldButton).to.not.equal(undefined);
            expect(infoldButton.disabled).to.equal(false);
        });

        it("passes up the inverted chord on click", () => {
            let output = null;
            const component = renderIntoDocument(<TrichordView
                {...baseProps}
                onChange={x => {
                    output = x;
                }}
            />);
            const infoldButton = findInfold(component);
            expect(output).to.equal(null);
            Simulate.click(infoldButton);
            expect(output).to.deep.equal([0, 1, 4]);  // was [0, 4, 7]
        });

        it("is disabled for the root of a tree", () => {
            const component = renderIntoDocument(<TrichordView
                {...baseProps}
                notes={[0, 2, 4]}
                onChange={() => {}}
            />);
            const infoldButton = findInfold(component);
            expect(infoldButton).to.not.equal(undefined);
            expect(infoldButton.disabled).to.equal(true);
        });

        it("is disabled for a non-root degenerate chord", () => {
            // (a degenerate chord is one where an interval is zero)
            const component = renderIntoDocument(<TrichordView
                {...baseProps}
                notes={[0, 0, 4]}
                onChange={() => {}}
            />);
            const infoldButton = findInfold(component);
            expect(infoldButton).to.not.equal(undefined);
            expect(infoldButton.disabled).to.equal(true);
        });

    });

});
