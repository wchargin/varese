import {describe, it} from 'mocha';
import {expect} from 'chai';

import {initialState} from '../TestData';

import CustomPropTypes from '../../src/components/CustomPropTypes';

function validate(validator, prop) {
    const props = { testProp: prop };
    const propName = 'testProp';
    const componentName = 'TestHarness';
    const error = validator(props, propName, componentName);
    if (error) {
        throw error;
    }
}
function expectToAccept(validator, prop) {
    expect(() => validate(validator, prop)).to.not.throw();
}
function expectToReject(validator, prop, message) {
    expect(() => validate(validator, prop)).to.throw(
        undefined, undefined, message);
}

function expectToValidateExactShape(validator, shape, referenceObjectName) {
    it(`should accept ${referenceObjectName}`, () => {
        expectToAccept(validator, shape);
    });
    it("should reject an object with any key missing", () => {
        Object.keys(shape).forEach(key => {
            const defectiveShape = { ...shape };
            delete defectiveShape[key];
            expectToReject(validator, defectiveShape, key);
        });
    });
    it("should reject an object with any key of the wrong type", () => {
        Object.keys(shape).forEach(key => {
            const isNumber = typeof shape[key] === 'number';
            const newValue = isNumber ? true : 99;
            const defectiveShape = { ...shape, [key]: newValue };
            expectToReject(validator, defectiveShape, key);
        });
    });
}

describe('CustomPropTypes', () => {

    describe('#limits', () => {
        expectToValidateExactShape(
            CustomPropTypes.limits,
            initialState.treeViewOptions.limits,
            "the initial Redux state's limits");
    });

    describe('#limitsHandlers', () => {
        const nominal = {
            onSetLimitValue: () => {},
            onSetLimitEnabled: () => {},
        };
        expectToValidateExactShape(
            CustomPropTypes.limitsHandlers,
            nominal,
            "an object with two general-purpose setters");
    });

    describe('#viewOptions', () => {
        expectToValidateExactShape(
            CustomPropTypes.viewOptions,
            initialState.treeViewOptions,
            "the initial Redux state's view options");
    });

    describe('#limitsHandlers', () => {
        const noop = () => {};
        const nominal = {
            onSetLevels: noop,
            onSetInfiniteLevels: noop,
            onSetInfiniteHeight: noop,
            onSetShowRoots: noop,
            onSetShowOctaves: noop,
            onSetWide: noop,
            onSetTreeNumber: noop,
            onSetRootBass: noop,
            onSetHighQuality: noop,
            onSetRainbowFactor: noop,
            onSetAlwaysEngrave: noop,
            onSetLimitValue: noop,
            onSetLimitEnabled: noop,
        };
        expectToValidateExactShape(
            CustomPropTypes.viewOptionsHandlers,
            nominal,
            "an object with a bunch of setters");
    });

});
