import {describe, describe as context, it} from 'mocha';
import {expect} from 'chai';

import React from 'react';
import {scryRenderedComponentsWithType} from 'react-addons-test-utils';
import {
    Simulate,
    renderIntoDocument,
    findOneWithTag,
    scryManyWithTag,
    makeBox,
    declareMochaMock,
} from '../../TestUtils';
import {initialState, canonicalRationalizer} from '../../TestData';

import TrichordView from '../../../src/components/tree/TrichordView';
import ChordEngraving from '../../../src/components/ChordEngraving';

describe('TrichordView', () => {

    const baseViewOptions = {
        ...initialState.treeViewOptions,
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

    context("when the chord is out of limits", () => {
        const notes = [0, 4, 888];
        const viewOptions = {
            ...baseViewOptions,
            limits: {
                ...baseViewOptions.limits,
                maxCombinedEnabled: true,
                maxCombined: 24,
            },
        };
        const props = {
            ...baseProps,
            viewOptions,
            notes,
        };
        const isTransparent = element => {
            const {opacity} = element.style;
            return 0 < opacity && opacity < 1;
        };
        it("renders a transparent view", () => {
            const component = renderIntoDocument(<TrichordView {...props} />);
            const divs = scryManyWithTag(component, 'div');
            expect(divs.filter(isTransparent)).to.have.length(1);
        });
        it("renders a transparent editor", () => {
            const component = renderIntoDocument(<TrichordView
                {...props}
                onChange={() => {}}
            />);
            const divs = scryManyWithTag(component, 'div');
            expect(divs.filter(isTransparent)).to.have.length(1);
        });
        it("renders a transparent button", () => {
            const component = renderIntoDocument(<TrichordView
                {...props}
                onClick={() => {}}
            />);
            const button = findOneWithTag(component, 'button');
            expect(button).to.satisfy(isTransparent);
        });
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

    // ActionBar is tested more extensively separately (ActionBarTest.jsx);
    // these examples just make sure that it's hooked up to the change handler.
    context("regarding the ActionBar", () => {
        it("passes the inverted chord when 'Invert' is clicked", () => {
            const {getBox, setBox} = makeBox(null);
            const component = renderIntoDocument(<TrichordView
                {...baseProps}
                onChange={x => setBox(x)}
            />);
            const invertButton = scryManyWithTag(component, 'button')
                .find(x => x.textContent === "Invert");
            expect(getBox()).to.equal(null);
            Simulate.click(invertButton);
            expect(getBox()).to.deep.equal([0, 3, 7]);  // was [0, 4, 7]
        });
        it("passes the infolded chord when 'Infold' is clicked", () => {
            const {getBox, setBox} = makeBox(null);
            const component = renderIntoDocument(<TrichordView
                {...baseProps}
                onChange={x => setBox(x)}
            />);
            const infoldButton = scryManyWithTag(component, 'button')
                .find(x => x.textContent === "Infold");
            expect(getBox()).to.equal(null);
            Simulate.click(infoldButton);
            expect(getBox()).to.deep.equal([0, 1, 4]);  // was [0, 4, 7]
        });
    });

    context("regarding the engraving", () => {
        // This tries to do some stuff with SVG bounding boxes,
        // which isn't implemented in JSDom (which is fine).
        declareMochaMock(ChordEngraving.prototype, '_renderNote', () => {});
        const renderComponent = () => renderIntoDocument(<TrichordView
            {...baseProps}
            onClick={() => {}}
        />);
        const findTarget = component => scryManyWithTag(component, 'div')[0];
        const findEngravings = component =>
            scryRenderedComponentsWithType(component, ChordEngraving);
        it("shows an engraving on mouseEnter", () => {
            const component = renderComponent();
            expect(findEngravings(component)).to.have.length(0);
            Simulate.mouseEnter(findTarget(component));
            expect(findEngravings(component)).to.have.length(1);
        });
        it("hides an engraving on mouseLeave", () => {
            const component = renderComponent();
            expect(findEngravings(component)).to.have.length(0);
            Simulate.mouseEnter(findTarget(component));
            expect(findEngravings(component)).to.have.length(1);
            Simulate.mouseLeave(findTarget(component));
            expect(findEngravings(component)).to.have.length(0);
        });
    });

});
