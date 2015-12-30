import {describe, it} from 'mocha';
import {expect} from 'chai';

import React from 'react';

import {
    Simulate,
    renderIntoDocument,
    scryManyWithTag,
    makeBox,
} from '../../TestUtils';

import LimitInput from '../../../src/components/settings/LimitInput';

describe('LimitInput', () => {

    const makeBoxesAndProps = (changes = {}) => {
        const values = {
            min: 10,
            max: 20,
            minEnabled: false,
            maxEnabled: true,
            ...changes,
        };
        const min = makeBox(values.min);
        const max = makeBox(values.max);
        const minEnabled = makeBox(values.minEnabled);
        const maxEnabled = makeBox(values.maxEnabled);
        return {
            boxes: { min, max, minEnabled, maxEnabled },
            props: {
                min: min.getBox(),
                max: max.getBox(),
                minEnabled: minEnabled.getBox(),
                maxEnabled: maxEnabled.getBox(),
                //
                onSetMin: min.setBox,
                onSetMax: max.setBox,
                onSetMinEnabled: minEnabled.setBox,
                onSetMaxEnabled: maxEnabled.setBox,
                //
                minLabel: "Minimum",
                maxLabel: "Maximum",
                minEnabledLabel: "Minimum enabled?",
                maxEnabledLabel: "Maximum enabled?",
            },
        };
    };
    const getCheckboxes = inputs => inputs.filter(x => x.type === 'checkbox');
    const getSpinners = inputs => inputs.filter(x => x.type === 'number');

    it("renders two spinners and two checkboxes", () => {
        const component = renderIntoDocument(<LimitInput
            {...makeBoxesAndProps().props}
        />);
        const inputs = scryManyWithTag(component, 'input');
        expect(inputs).to.have.length(4);
        expect(getCheckboxes(inputs)).to.have.length(2);
        expect(getSpinners(inputs)).to.have.length(2);
    });

    it("never disables checkboxes", () => {
        const component = renderIntoDocument(<LimitInput
            {...makeBoxesAndProps().props}
        />);
        const inputs = scryManyWithTag(component, 'input');
        getCheckboxes(inputs).forEach((spinner, index) =>
            expect(spinner.disabled).to.equal(false, "checkbox " + index));
    });

    it("disables spinners exactly when they should be disabled", () => {
        {
            const component = renderIntoDocument(<LimitInput
                {...makeBoxesAndProps().props}
            />);
            const inputs = scryManyWithTag(component, 'input');
            const spinners = getSpinners(inputs);
            expect(spinners[0].disabled).to.equal(true);
            expect(spinners[1].disabled).to.equal(false);
        }
        {
            const component = renderIntoDocument(<LimitInput
                {...makeBoxesAndProps({
                    minEnabled: true,
                    maxEnabled: false,
                }).props}
            />);
            const inputs = scryManyWithTag(component, 'input');
            const spinners = getSpinners(inputs);
            expect(spinners[0].disabled).to.equal(false);
            expect(spinners[1].disabled).to.equal(true);
        }
    });

    it("renders an empty value when a spinner is disabled", () => {
        const component = renderIntoDocument(<LimitInput
            {...makeBoxesAndProps().props}
        />);
        const inputs = scryManyWithTag(component, 'input');
        const spinners = getSpinners(inputs);
        expect(spinners[0].value).to.equal("");
        expect(spinners[1].value).to.not.equal("");
    });

    it("calls the callbacks for the checkboxes", () => {
        const {boxes, props} = makeBoxesAndProps();
        const component = renderIntoDocument(<LimitInput {...props} />);
        const inputs = scryManyWithTag(component, 'input');
        const checkboxes = getCheckboxes(inputs);

        const makeEvent = checked => ({ target: { checked } });

        // Make sure the 'minEnabled' checkbox works.
        expect(boxes.minEnabled.getBox()).to.equal(false);
        Simulate.change(checkboxes[0], makeEvent(true));
        expect(boxes.minEnabled.getBox()).to.equal(true);
        Simulate.change(checkboxes[0], makeEvent(false));
        expect(boxes.minEnabled.getBox()).to.equal(false);

        // Make sure the 'maxEnabled' checkbox works.
        expect(boxes.maxEnabled.getBox()).to.equal(true);
        Simulate.change(checkboxes[1], makeEvent(false));
        expect(boxes.maxEnabled.getBox()).to.equal(false);
        Simulate.change(checkboxes[1], makeEvent(true));
        expect(boxes.maxEnabled.getBox()).to.equal(true);
    });

    it("calls the callbacks for the spinners", () => {
        const {boxes, props} = makeBoxesAndProps();
        const component = renderIntoDocument(<LimitInput {...props} />);
        const inputs = scryManyWithTag(component, 'input');
        const spinners = getSpinners(inputs);

        const makeEvent = valueAsNumber => ({ target: { valueAsNumber } });

        // Make sure the 'min' spinner works.
        expect(boxes.min.getBox()).to.equal(10);
        Simulate.change(spinners[0], makeEvent(20));
        expect(boxes.min.getBox()).to.equal(20);
        Simulate.change(spinners[0], makeEvent(30));
        expect(boxes.min.getBox()).to.equal(30);

        // Make sure the 'max' spinner works.
        expect(boxes.max.getBox()).to.equal(20);
        Simulate.change(spinners[1], makeEvent(15));
        expect(boxes.max.getBox()).to.equal(15);
        Simulate.change(spinners[1], makeEvent(12));
        expect(boxes.max.getBox()).to.equal(12);
    });

});
