/*
 * Simple tests for the LimitOptions component.
 * These tests are reasonably lightweight
 * because LimitOptions is assumed to just encapsulate two LimitInputs,
 * and those are tested more extensively.
 */
import {describe, it} from 'mocha';
import {expect} from 'chai';

import React from 'react';

import {
    Simulate,
    renderIntoDocument,
    scryManyWithTag,
    scryManyWithType,
    makeBox,
} from '../../TestUtils';
import {initialState} from '../../TestData';

import LimitsOptions from '../../../src/components/settings/LimitsOptions';
import LimitInput from '../../../src/components/settings/LimitInput';

describe('LimitsOptions', () => {
    const baseValues = {
        ...initialState.treeViewOptions.limits,
    };
    const baseHandlers = {
        onSetLimitValue: () => {},
        onSetLimitEnabled: () => {},
    };

    it("renders two LimitInput components", () => {
        const component = renderIntoDocument(<LimitsOptions
            values={baseValues}
            handlers={baseHandlers}
        />);
        const limitInputs = scryManyWithType(component, LimitInput);
        expect(limitInputs).to.have.length(2);
    });

    it("sets the 'minCombined' field", () => {
        const {getBox, setBox} = makeBox();
        const component = renderIntoDocument(<LimitsOptions
            values={{
                ...baseValues,
                minCombinedEnabled: true,
                minCombined: 22,
            }}
            handlers={{
                ...baseHandlers,
                onSetLimitValue: (limit, value) => {
                    expect(limit).to.equal('minCombined');
                    setBox(value);
                },
            }}
        />);
        const combinedEditor = scryManyWithType(component, LimitInput)[1];
        const inputs = scryManyWithTag(combinedEditor, 'input');
        const spinners = inputs.filter(x => x.type === 'number');
        const input = spinners[0];
        Simulate.change(input, { target: { valueAsNumber: 33 }});
        expect(getBox()).to.equal(33);
    });

    it("sets the 'maxIndividualEnabled' field", () => {
        const {getBox, setBox} = makeBox();
        const component = renderIntoDocument(<LimitsOptions
            values={{
                ...baseValues,
                maxIndividualEnabled: true,
                maxIndividual: 17,
            }}
            handlers={{
                ...baseHandlers,
                onSetLimitEnabled: (limit, value) => {
                    expect(limit).to.equal('maxIndividual');
                    setBox(value);
                },
            }}
        />);
        const combinedEditor = scryManyWithType(component, LimitInput)[0];
        const inputs = scryManyWithTag(combinedEditor, 'input');
        const checkboxes = inputs.filter(x => x.type === 'checkbox');
        const input = checkboxes[1];
        Simulate.change(input, { target: { checked: false }});
        expect(getBox()).to.equal(false);
    });

});
