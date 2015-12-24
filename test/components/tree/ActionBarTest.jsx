import {describe, it} from 'mocha';
import {expect} from 'chai';

import React from 'react';
import {
    Simulate,
    renderIntoDocument,
    scryManyWithTag,
} from '../../TestUtils';

import ActionBar from '../../../src/components/tree/ActionBar';

describe('ActionBar', () => {

    const baseProps = {
        chord: [0, 4, 7],
        onSetChord: () => {},
    };

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

    describe("'Invert' button", () => {
        const findInvert = component => scryManyWithTag(component, 'button')
            .find(x => x.textContent === "Invert");

        it("passes up the inverted chord on click", () => {
            const {getBox, setBox} = makeBox(null);
            const component = renderIntoDocument(<ActionBar
                {...baseProps}
                onSetChord={x => setBox(x)}
            />);
            const invertButton = findInvert(component);
            expect(getBox()).to.equal(null);
            Simulate.click(invertButton);
            expect(getBox()).to.deep.equal([0, 3, 7]);  // was [0, 4, 7]
        });

        it("is disabled for the root of a tree", () => {
            const component = renderIntoDocument(<ActionBar
                {...baseProps}
                chord={[0, 2, 4]}
            />);
            const invertButton = findInvert(component);
            expect(invertButton).to.not.equal(undefined);
            expect(invertButton.disabled).to.equal(true);
        });

        it("is enabled for a non-root degenerate chord", () => {
            // (a degenerate chord is one where an interval is zero)
            const component = renderIntoDocument(<ActionBar
                {...baseProps}
                chord={[0, 0, 4]}
            />);
            const invertButton = findInvert(component);
            expect(invertButton).to.not.equal(undefined);
            expect(invertButton.disabled).to.equal(false);
        });

    });

    describe("'Infold' button", () => {
        const findInfold = component => scryManyWithTag(component, 'button')
            .find(x => x.textContent === "Infold");

        it("passes up the inverted chord on click", () => {
            const {getBox, setBox} = makeBox(null);
            const component = renderIntoDocument(<ActionBar
                {...baseProps}
                onSetChord={x => setBox(x)}
            />);
            const infoldButton = findInfold(component);
            expect(getBox()).to.equal(null);
            Simulate.click(infoldButton);
            expect(getBox()).to.deep.equal([0, 1, 4]);  // was [0, 4, 7]
        });

        it("is disabled for the root of a tree", () => {
            const component = renderIntoDocument(<ActionBar
                {...baseProps}
                chord={[0, 2, 4]}
            />);
            const infoldButton = findInfold(component);
            expect(infoldButton).to.not.equal(undefined);
            expect(infoldButton.disabled).to.equal(true);
        });

        it("is disabled for a non-root degenerate chord", () => {
            // (a degenerate chord is one where an interval is zero)
            const component = renderIntoDocument(<ActionBar
                {...baseProps}
                chord={[0, 0, 4]}
            />);
            const infoldButton = findInfold(component);
            expect(infoldButton).to.not.equal(undefined);
            expect(infoldButton.disabled).to.equal(true);
        });

    });

});
