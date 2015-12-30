import {describe, describe as context, it, before} from 'mocha';
import {expect} from 'chai';

import React from 'react';

import {
    Simulate,
    renderIntoDocument,
    scryManyWithTag,
    makeBox,
} from '../TestUtils';
import {initialState} from '../TestData';

import StackedNoteInput from '../../src/components/StackedNoteInput';

describe('StackedNoteInput', () => {
    const baseViewOptions = initialState.treeViewOptions;
    const viewOptionsOctavesShown = {
        ...baseViewOptions,
        showOctaves: true,
    };
    const viewOptionsOctavesHidden = {
        ...baseViewOptions,
        showOctaves: false,
    };

    it("renders the outer div with the provided style", () => {
        const component = renderIntoDocument(<StackedNoteInput
            value={[1, 5, 8]}
            onChange={() => {}}
            viewOptions={viewOptionsOctavesShown}
            style={{ outline: "thin red solid" }}
            inputProps={{ style: { outline: "thick blue dotted" } }}
        />);
        const div = scryManyWithTag(component, 'div')[0];
        expect(div.style.outline).to.equal("thin red solid");
    });

    it("renders the input elements with the provided extra props", () => {
        const component = renderIntoDocument(<StackedNoteInput
            value={[1, 5, 8]}
            onChange={() => {}}
            viewOptions={viewOptionsOctavesShown}
            style={{ outline: "thin red solid" }}
            inputProps={{
                style: { outline: "thick blue dotted" },
                className: "magical",
            }}
        />);
        const inputs = scryManyWithTag(component, 'input');
        expect(inputs.length).to.be.at.least(1);
        inputs.forEach(input => {
            expect(input.style.outline).to.equal("thick blue dotted");
            expect(input.className).to.equal("magical");
        });
    });

    it("renders a chord with the right notes", () => {
        const component = renderIntoDocument(<StackedNoteInput
            value={[1, 5, 8]}
            onChange={() => {}}
            viewOptions={viewOptionsOctavesShown}
        />);
        const inputs = scryManyWithTag(component, 'input');
        expect(inputs).to.have.length(3);
        //
        // Notes should be in descending order from top to bottom.
        expect(inputs[0].value).to.equal('A\u266D4');
        expect(inputs[1].value).to.equal('F4');
        expect(inputs[2].value).to.equal('C\u266F4');
    });

    it("renders without octaves if so specified by the viewOptions", () => {
        const component = renderIntoDocument(<StackedNoteInput
            value={[1, 5, 8]}
            onChange={() => {}}
            viewOptions={viewOptionsOctavesHidden}
        />);
        const inputs = scryManyWithTag(component, 'input');
        expect(inputs).to.have.length(3);
        expect(inputs[0].value).to.equal('A\u266D');
        expect(inputs[1].value).to.equal('F');
        expect(inputs[2].value).to.equal('C\u266F');
    });

    describe("focus and display text interactions", () => {
        let sharedComponent;
        const getInputs = () => scryManyWithTag(sharedComponent, 'input');
        before("render the component", () => {
            sharedComponent = renderIntoDocument(<StackedNoteInput
                value={[1, 5, 8]}
                onChange={() => {}}
                viewOptions={viewOptionsOctavesHidden}
            />);
        });
        it("changes the text to show octaves on focus", () => {
            const firstInput = getInputs()[0];
            expect(firstInput.value).to.equal('A\u266D');
            Simulate.focus(firstInput);
            expect(firstInput.value).to.equal('A\u266D4');
        });
        it("changes the text to invalid user input", () => {
            const firstInput = getInputs()[0];
            Simulate.change(firstInput, { target: { value: "A-four" } });
            expect(firstInput.value).to.equal("A-four");
        });
        it("changes the text to valid user input, verbatim", () => {
            const firstInput = getInputs()[0];
            Simulate.change(firstInput, { target: { value: "A" } });
            //
            // note: not changed to A4
            expect(firstInput.value).to.equal("A");
        });
        it("normalizes the text on blur", () => {
            const firstInput = getInputs()[0];
            Simulate.blur(firstInput);
            //
            // note: no change handler attached,
            // so should go back to the old value
            expect(firstInput.value).to.equal("A\u266D");
        });
        it("sets the correct text when switching to a different input", () => {
            const secondInput = getInputs()[1];
            expect(secondInput.value).to.equal('F');
            Simulate.focus(secondInput);
            expect(secondInput.value).to.equal('F4');
        });
    });

    describe("change handler", () => {
        const {getBox, setBox} = makeBox([0, 4, 7]);
        const renderComponent = () => renderIntoDocument(<StackedNoteInput
            value={getBox()}
            onChange={setBox}
            viewOptions={viewOptionsOctavesShown}
        />);
        const getInputs = (component) => scryManyWithTag(component, 'input');
        it("isn't changed on the initial render", () => {
            renderComponent();
            expect(getBox()).to.deep.equal([0, 4, 7]);
        });
        it("is invoked when the value changes to another valid value", () => {
            const inputs = getInputs(renderComponent());
            Simulate.focus(inputs[1]);
            Simulate.change(inputs[1], { target: { value: "F" } });
            expect(getBox()).to.deep.equal([0, 5, 7]);
        });
        it("isn't invoked when the value changes to an invalid value", () => {
            const inputs = getInputs(renderComponent());
            Simulate.change(inputs[1], { target: { value: "F-sharp!!" } });
            expect(getBox()).to.deep.equal([0, 5, 7]);
        });
        it("is invoked when the value changes from invalid to valid", () => {
            const inputs = getInputs(renderComponent());
            Simulate.change(inputs[1], { target: { value: "F#4" } });
            expect(getBox()).to.deep.equal([0, 6, 7]);
        });
    });

    context("should fire a change event, " +
            "set the focus, " +
            "and update the display text when rearranging pitches to", () => {
        const {getBox, setBox} = makeBox([0, 4, 7]);
        const renderComponent = () => renderIntoDocument(<StackedNoteInput
            value={getBox()}
            onChange={setBox}
            viewOptions={viewOptionsOctavesShown}
        />);
        const getInputs = (component) => scryManyWithTag(component, 'input');
        const runSpec = ({ fromInput, toInput, value, expected }) => {
            const indexNames = ["top", "middle", "bottom"];
            const from = indexNames[fromInput];
            const to = indexNames[toInput];
            const direction = fromInput > toInput ? "above" : "below";
            it(`move the ${from} pitch ${direction} the ${to} pitch`, () => {
                const inputs = getInputs(renderComponent());
                const event = { target: { value } };
                Simulate.change(inputs[fromInput], event);
                //
                // Make sure the new value is set right,
                // the new text field was updated with the display text,
                // and the new text box is focused.
                expect(getBox()).to.deep.equal(expected);
                expect(inputs[toInput].value).to.equal(value);
                expect(document.activeElement).to.equal(inputs[toInput]);
            });
        };
        //
        // We'll execute all these specs on a shared state,
        // starting with [0, 4, 7].
        // So, for example, when we move the middle pitch above the top pitch,
        // the state will be updated to [0, 7, 12];
        // when we then move the top pitch below the bottom pitch,
        // this will move the 12, not the 7, below the zero,
        // so the new state will be [-12, 0, 7].
        const specs = [{
            // middle above high
            fromInput: 1,
            toInput: 0,
            value: "C'",
            expected: [0, 7, 12],
        },
        {
            // top below bottom
            fromInput: 0,
            toInput: 2,
            value: "C,",
            expected: [-12, 0, 7],
        },
        {
            // bottom above middle
            fromInput: 2,
            toInput: 1,
            value: "D#",
            expected: [0, 3, 7],
        },
        {
            // middle below bottom
            fromInput: 1,
            toInput: 2,
            value: "Cb",
            expected: [-1, 0, 7],
        },
        {
            // bottom above top
            fromInput: 2,
            toInput: 0,
            value: "19",
            expected: [0, 7, 19],
        },
        {
            // top below middle
            fromInput: 0,
            toInput: 1,
            value: "E",
            expected: [0, 4, 7],
        }];
        specs.forEach(runSpec);
    });

    context("when pressing the arrow keys", () => {
        const {getBox, setBox} = makeBox([0, 4, 7]);
        const renderComponent = () => renderIntoDocument(<StackedNoteInput
            value={getBox()}
            onChange={setBox}
            viewOptions={viewOptionsOctavesShown}
        />);
        const getInputs = (component) => scryManyWithTag(component, 'input');
        const runSpec = (({
            specName,
            first = false,
            blurInputIndex = null,
            inputIndex,
            newFocusedIndex = inputIndex,
            event,
            newNotes,
            newTexts,
        }) => {
            it(specName, () => {
                const inputs = getInputs(renderComponent());
                if (blurInputIndex !== null) {
                    Simulate.blur(inputs[blurInputIndex]);
                }
                if (first || blurInputIndex !== null) {
                    Simulate.focus(inputs[inputIndex]);
                }
                Simulate.keyDown(inputs[inputIndex], event);
                expect(getBox()).to.deep.equal(newNotes);
                const rerenderedInputs = getInputs(renderComponent());
                expect(rerenderedInputs.map(x => x.value))
                    .to.deep.equal(newTexts);
                expect(document.activeElement).to.equal(
                    inputs[newFocusedIndex]);
            });
        });
        const specs = [{
            specName: "should raise a note by a semitone",
            first: true,
            inputIndex: 1,      // middle
            event: { key: "ArrowUp" },
            newNotes: [0, 5, 7],
            newTexts: ["G4", "F4", "C4"],
        }, {
            specName: "should raise a note by another semitone",
            inputIndex: 1,      // middle
            event: { key: "ArrowUp" },
            newNotes: [0, 6, 7],
            newTexts: ["G4", "F\u266F4", "C4"],
        }, {
            specName: "should raise a note by an octave",
            blurInputIndex: 1,  // middle
            inputIndex: 0,      // top
            event: { key: "ArrowUp", shiftKey: true },
            newNotes: [0, 6, 19],
            newTexts: ["G5", "F\u266F4", "C4"],
        }, {
            specName: "should lower a note by a semitone",
            inputIndex: 0,      // top
            event: { key: "ArrowDown" },
            newNotes: [0, 6, 18],
            newTexts: ["F\u266F5", "F\u266F4", "C4"],
        }, {
            specName: "should lower a note by another semitone",
            inputIndex: 0,      // top
            event: { key: "ArrowDown" },
            newNotes: [0, 6, 17],
            newTexts: ["F5", "F\u266F4", "C4"],
        }, {
            specName: "should lower a note by an octave",
            blurInputIndex: 0,  // top
            inputIndex: 2,      // bottom
            event: { key: "ArrowDown", shiftKey: true },
            newNotes: [-12, 6, 17],
            newTexts: ["F5", "F\u266F4", "C3"],
        }, {
            specName: "should lower a note by an octave, across another note",
            blurInputIndex: 2,  // bottom
            inputIndex: 0,      // top
            event: { key: "ArrowDown", shiftKey: true },
            newNotes: [-12, 5, 6],
            newTexts: ["F\u266F4", "F4", "C3"],
            newFocusedIndex: 1,     // used to be top; is now middle
        }];
        specs.forEach(runSpec);
    });

    it("should ignore when non-arrow keys are pressed", () => {
        const {getBox, setBox} = makeBox([0, 4, 7]);
        const component = renderIntoDocument(<StackedNoteInput
            value={getBox()}
            onChange={setBox}
            viewOptions={viewOptionsOctavesShown}
        />);
        const input = scryManyWithTag(component, 'input')[1];
        ["A", "W", "Space", "Enter"].forEach(key => {
            Simulate.keyDown(input, { key, repeat: false });
            expect(getBox()).to.deep.equal([0, 4, 7]);
        });
    });

});
