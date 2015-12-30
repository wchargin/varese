import {describe, it} from 'mocha';
import {expect} from 'chai';

import React, {Component} from 'react';

import {
    Simulate,
    renderIntoDocument,
    scryManyWithTag,
    findOneWithTag,
    scryManyWithClass,
    findOneWithClass,
    makeBox,
} from '../TestUtils';

import ChordInput from '../../src/components/ChordInput';

describe('ChordInput', () => {

    const baseProps = {
        value: [0, 4, 7],
        onChange: () => {},
        message: "Enter a chord",
        exactly: undefined,
    };

    it("should render a label matching the provided message", () => {
        const component = renderIntoDocument(<ChordInput {...baseProps} />);
        const labels = scryManyWithTag(component, 'label');
        expect(labels).to.have.length(1);
        expect(labels[0].textContent).to.equal(baseProps.message);
    });

    it("should render an input element", () => {
        const component = renderIntoDocument(<ChordInput {...baseProps} />);
        expect(scryManyWithTag(component, 'input')).to.have.length(1);
    });

    it("should focus the input element on mount", () => {
        const component = renderIntoDocument(<ChordInput {...baseProps} />);
        expect(document.activeElement).to.equal(
            findOneWithTag(component, 'input'));
    });

    it("should point the label to the input element", () => {
        const component = renderIntoDocument(<ChordInput {...baseProps} />);
        expect(findOneWithTag(component, 'label').htmlFor)
            .to.equal(findOneWithTag(component, 'input').id);
    });

    it("shouldn't display an error before any user input", () => {
        const component = renderIntoDocument(<ChordInput {...baseProps} />);
        expect(scryManyWithClass(component, 'error-message'))
            .to.have.length(0);
    });

    it("should call the callback when a valid change occurs", () => {
        const {getBox, setBox} = makeBox();
        const component = renderIntoDocument(<ChordInput
            {...baseProps}
            onChange={setBox}
        />);
        const input = findOneWithTag(component, 'input');
        Simulate.change(input, { target: { value: "C G C'" } });
        expect(getBox()).to.deep.equal([0, 7, 12]);
    });

    it("shouldn't display an error after a valid change", () => {
        const {setBox} = makeBox();
        const component = renderIntoDocument(<ChordInput
            {...baseProps}
            onChange={setBox}
        />);
        const input = findOneWithTag(component, 'input');
        Simulate.change(input, { target: { value: "C G C'" } });
        expect(scryManyWithClass(component, 'error-message'))
            .to.have.length(0);
    });

    it("should leave the text formatted after a change", () => {
        const {setBox} = makeBox();
        const component = renderIntoDocument(<ChordInput
            {...baseProps}
            onChange={setBox}
        />);
        const input = findOneWithTag(component, 'input');
        Simulate.change(input, { target: { value: "C G C'" } });
        expect(input.value).to.equal("C\u2002G\u2002C'");
    });

    it("should normalize the text on blur", () => {
        class StatefulWrapper extends Component {
            constructor() {
                super();
                this.state = {
                    notes: [0, 4, 7],
                };
            }
            render() {
                return <ChordInput
                    {...baseProps}
                    value={this.state.notes}
                    onChange={notes => this.setState({ notes })}
                />;
            }
        }
        const component = renderIntoDocument(<StatefulWrapper />);
        const input = findOneWithTag(component, 'input');
        Simulate.change(input, { target: { value: "C G C'" } });
        Simulate.blur(input);
        expect(input.value).to.equal("C4\u2002G4\u2002C5");
    });

    it("should display an error for invalid tokens", () => {
        const {getBox, setBox} = makeBox([0, 4, 7]);
        const component = renderIntoDocument(<ChordInput
            {...baseProps}
            notes={getBox()}
            onChange={setBox}
        />);
        const input = findOneWithTag(component, 'input');
        Simulate.change(input, { target: { value: "C E nope" } });
        expect(getBox()).to.deep.equal([0, 4, 7]);  // unchanged
        const error = findOneWithClass(component, 'error-message');
        expect(error.textContent).to.contain('valid note');
    });

    it("should display an error for the wrong number of notes", () => {
        const {getBox, setBox} = makeBox([0, 4, 7]);
        const component = renderIntoDocument(<ChordInput
            {...baseProps}
            notes={getBox()}
            onChange={setBox}
            exactly={3}
        />);
        const input = findOneWithTag(component, 'input');
        Simulate.change(input, { target: { value: "C E G B" } });
        expect(getBox()).to.deep.equal([0, 4, 7]);  // unchanged
        const error = findOneWithClass(component, 'error-message');
        expect(error.textContent).to.contain('exactly 3');
    });

    it("should have no problem if the text field is cleared", () => {
        const {getBox, setBox} = makeBox();
        const component = renderIntoDocument(<ChordInput
            {...baseProps}
            onChange={setBox}
        />);
        const input = findOneWithTag(component, 'input');
        Simulate.change(input, { target: { value: "" } });
        expect(getBox()).to.deep.equal([]);
    });

    it("should unmount cleanly", () => {
        class MountUnmountWrapper extends Component {
            constructor() {
                super();
                this.state = {
                    mounted: true,
                };
            }
            render() {
                return this.state.mounted ?
                    <ChordInput {...baseProps} /> :
                    <div />;
            }
        }
        const component = renderIntoDocument(<MountUnmountWrapper />);
        expect(scryManyWithTag(component, 'input')).to.have.length(1);
        component.setState({ mounted: false });
        expect(scryManyWithTag(component, 'input')).to.have.length(0);
    });

});
