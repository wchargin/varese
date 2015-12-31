import {describe, it, before} from 'mocha';
import {expect} from 'chai';

import React from 'react';

import {
    Simulate,
    renderIntoDocument,
    scryManyWithTag,
    scryManyWithClass,
    makeBox,
} from '../../TestUtils';
import {canonicalValues} from '../../../src/core/HarmonicData';
import Rational from '../../../src/core/Rational';

import RationalizerSettings
    from '../../../src/components/settings/RationalizerSettings';

describe('RationalizerSettings', () => {
    const scryWarnings = component =>
        scryManyWithClass(component, 'alert-warning');

    describe("renders the canonical rationalizer", () => {
        let component;
        before("render the component", () => {
            component = renderIntoDocument(<RationalizerSettings
                values={canonicalValues}
                onChangeValue={() => {}}
            />);
        });
        it("without warnings", () =>
            expect(scryWarnings(component)).to.have.length(0));
        it("with the right number of input fields", () =>
            expect(scryManyWithTag(component, 'input'))
                .to.have.length(canonicalValues.length).at.least(1));
        it("with the right value in each input field", () => {
            scryManyWithTag(component, 'input').forEach((input, index) => {
                const rational = canonicalValues[index];
                expect(input.value).to.equal(`${rational.a}:${rational.b}`);
            });
        });
        it("with no reset buttons", () =>
            expect(scryManyWithTag(component, 'button')).to.have.length(0));
    });

    describe("renders warnings", () => {
        it("when one of the values is zero", () => {
            const values = [
                ...canonicalValues.slice(0, canonicalValues.length - 1),
                new Rational(0, 1),
            ];
            const component = renderIntoDocument(<RationalizerSettings
                values={values}
                onChangeValue={() => {}}
            />);
            const warnings = scryWarnings(component);
            expect(warnings).to.have.length(1);
            expect(warnings[0].textContent).to.contain('zero');
        });
        it("when one of the intervals is not descending", () => {
            const values = [
                ...canonicalValues.slice(0, canonicalValues.length - 1),
                new Rational(4, 1),
            ];
            const component = renderIntoDocument(<RationalizerSettings
                values={values}
                onChangeValue={() => {}}
            />);
            const warnings = scryWarnings(component);
            expect(warnings).to.have.length(1);
            expect(warnings[0].textContent).to.contain('descending');
        });
        it("when there's both a zero and a non-descending pair", () => {
            const values = [
                ...canonicalValues.slice(0, canonicalValues.length - 2),
                new Rational(4, 1),
                new Rational(0, 1),
            ];
            const component = renderIntoDocument(<RationalizerSettings
                values={values}
                onChangeValue={() => {}}
            />);
            const warnings = scryWarnings(component);
            expect(warnings).to.have.length(2);
            expect(warnings.find(x =>
                    x.textContent.indexOf('zero') !== -1))
               .to.not.equal(undefined);
            expect(warnings.find(x =>
                    x.textContent.indexOf('descending') !== -1))
               .to.not.equal(undefined);
        });
    });

    describe("for user input", () => {
        const {getBox, setBox} = makeBox(canonicalValues);
        const renderComponent = () => renderIntoDocument(<RationalizerSettings
            values={getBox()}
            onChangeValue={(index, value) => setBox([
                ...getBox().slice(0, index),
                value,
                ...getBox().slice(index + 1),
            ])}
        />);
        const getInput = component =>
            scryManyWithTag(component, 'input')[0];
        it("processes a click handler", () => {
            // TODO(william): upgrade JSDom to get the selection API
            // (see tmpvar/jsdom#1305)
            // so that we can write a proper test here
            // instead of just noting that it doesn't crah.
            const component = renderComponent();
            const input = getInput(component);
            Simulate.click(input);
        });
        it("lets the user type some text that's not quite right", () => {
            const component = renderComponent();
            const input = getInput(component);
            Simulate.change(input, { target: { value: 'bob' } });
            expect(input.value).to.equal('bob');
            expect(getBox()).to.equal(canonicalValues);
        });
        it("fails gracefully with division by zero", () => {
            const component = renderComponent();
            const input = getInput(component);
            Simulate.change(input, { target: { value: '1:0' } });
            expect(input.value).to.equal('1:0');
            expect(getBox()).to.equal(canonicalValues);
        });
        it("discards unsaved changes on blur", () => {
            const component = renderComponent();
            const input = getInput(component);
            const originalValue = input.value;
            Simulate.change(input, { target: { value: 'bob' } });
            expect(input.value).to.equal('bob');
            Simulate.blur(input);
            expect(input.value).to.equal(originalValue);
        });
        it("lets the user type a new valid Rational", () => {
            const component = renderComponent();
            const input = getInput(component);
            Simulate.change(input, { target: { value: '7:11' } });
            expect(input.value).to.equal('7:11');
            expect(getBox()).to.deep.equal([
                new Rational(7, 11),
                ...canonicalValues.slice(1),
            ]);
        });
        it("handles a reset to the canonical value", () => {
            const component = renderComponent();
            const button = scryManyWithTag(component, 'button')[0];
            expect(getBox()).to.not.deep.equal(canonicalValues);
            expect(button.textContent).to.equal('Reset');
            Simulate.click(button);
            expect(getBox()).to.deep.equal(canonicalValues);
        });
    });

});
