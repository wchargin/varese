import {describe, it} from 'mocha';
import {expect} from 'chai';

import React from 'react';

import {
    Simulate,
    renderIntoDocument,
    scryManyWithTag,
    findOneWithTag,
    findOneWithClass,
    scryManyWithType,
    findOneWithType,
    makeBox,
} from '../../TestUtils';
import {initialState} from '../../TestData';

import ViewOptions from '../../../src/components/settings/ViewOptions';
import LimitsOptions from '../../../src/components/settings/LimitsOptions';
import StackedNoteInput from '../../../src/components/StackedNoteInput';

describe('ViewOptions', () => {
    const noop = () => {};
    const baseValues = {
        ...initialState.treeViewOptions,
    };
    const baseHandlers = {
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

    function expectToggles(component, buttonIndex, isOpen, startsOpen = true) {
        const findButton = () =>
            findOneWithClass(component, 'btn-group')
                .getElementsByTagName('button')[buttonIndex];
        const buttonActive = () =>
            findButton().className.indexOf('btn-primary') !== -1;
        //
        expect(isOpen()).to.equal(startsOpen);
        expect(buttonActive()).to.equal(startsOpen);
        //
        Simulate.click(findButton());
        expect(isOpen()).to.equal(!startsOpen);
        expect(buttonActive()).to.equal(!startsOpen);
        //
        Simulate.click(findButton());
        expect(isOpen()).to.equal(startsOpen);
        expect(buttonActive()).to.equal(startsOpen);
    }
    function hasElementWithContent(component, tag, content) {
        return scryManyWithTag(component, tag)
            .filter(x => x.textContent === content)
            .length > 0;
    }

    describe("for the finite tree", () => {
        const baseProps = {
            infinite: false,
            values: baseValues,
            handlers: baseHandlers,
        };
        const baseElement = <ViewOptions {...baseProps} />;
        it("renders", () => renderIntoDocument(baseElement));
        it("shows two buttons for folding", () => {
            const component = renderIntoDocument(baseElement);
            const btnGroup = findOneWithClass(component, 'btn-group');
            const buttons = btnGroup.getElementsByTagName('button');
            expect(buttons).to.have.length(2);
            expect(buttons[0].textContent).to.equal('Interval limits');
            expect(buttons[1].textContent).to.equal('Display settings');
        });
        it("toggles the interval limits view", () => {
            const component = renderIntoDocument(baseElement);
            const limitsOpen = () =>
                scryManyWithType(component, LimitsOptions).length > 0;
            expectToggles(component, 0, limitsOpen);
       });
        it("toggles the display settings view", () => {
            const component = renderIntoDocument(baseElement);
            const displaySettingsOpen = () => hasElementWithContent(
                component, 'label', 'Show roots?');
            expectToggles(component, 1, displaySettingsOpen);
        });
        it("sets the levels", () => {
            const {getBox, setBox} = makeBox(3);
            const component = renderIntoDocument(<ViewOptions
                {...baseProps}
                values={{
                    ...baseValues,
                    levels: getBox(),
                }}
                handlers={{
                    ...baseHandlers,
                    onSetLevels: setBox,
                }}
            />);
            Simulate.change(
                scryManyWithTag(component, 'input')
                    .filter(x => x.id === 'depth')[0],
                { target: { valueAsNumber: 5 } });
            expect(getBox()).to.equal(5);
        });
    });

    describe("for the infinite tree", () => {
        const baseProps = {
            infinite: true,
            values: baseValues,
            handlers: baseHandlers,
        };
        const baseElement = <ViewOptions {...baseProps} />;
        it("renders", () => renderIntoDocument(baseElement));
        it("shows two buttons for folding", () => {
            const component = renderIntoDocument(baseElement);
            const btnGroup = findOneWithClass(component, 'btn-group');
            const buttons = btnGroup.getElementsByTagName('button');
            expect(buttons).to.have.length(4);
            expect(buttons[0].textContent).to.equal('Interval limits');
            expect(buttons[1].textContent).to.equal('Tree configuration');
            expect(buttons[2].textContent).to.equal('Display settings');
            expect(buttons[3].textContent).to.equal('Advanced settings');
        });
        it("toggles the interval limits view", () => {
            const component = renderIntoDocument(baseElement);
            const limitsOpen = () =>
                scryManyWithType(component, LimitsOptions).length > 0;
            expectToggles(component, 0, limitsOpen);
        });
        it("toggles the tree configuration view", () => {
            const component = renderIntoDocument(baseElement);
            const treeConfigurationOpen = () => hasElementWithContent(
                component, 'label', 'Tree number');
            expectToggles(component, 1, treeConfigurationOpen);
        });
        it("toggles the display settings view", () => {
            const component = renderIntoDocument(baseElement);
            const displaySettingsOpen = () => hasElementWithContent(
                component, 'label', 'Show roots?');
            expectToggles(component, 2, displaySettingsOpen);
        });
        it("toggles the advanced settings view, which starts disabled", () => {
            const component = renderIntoDocument(baseElement);
            const advancedSettingsOpen = () => hasElementWithContent(
                component, 'label', 'Display quality');
            expectToggles(component, 3, advancedSettingsOpen, false);
            // (the 'false' argument indicates that it starts disabled)
        });
        it("sets the tree number", () => {
            const {getBox, setBox} = makeBox(3);
            const component = renderIntoDocument(<ViewOptions
                {...baseProps}
                values={{
                    ...baseValues,
                    treeNumber: getBox(),
                }}
                handlers={{
                    ...baseHandlers,
                    onSetTreeNumber: setBox,
                }}
            />);
            Simulate.change(
                scryManyWithTag(component, 'input')
                    .filter(x => x.id === 'treeNumber')[0],
                { target: { value: '5' } });
            expect(getBox()).to.equal(5);
        });
        it("sets the root bass", () => {
            const {getBox, setBox} = makeBox(1);
            const component = renderIntoDocument(<ViewOptions
                {...baseProps}
                values={{
                    ...baseValues,
                    rootBass: getBox(),
                }}
                handlers={{
                    ...baseHandlers,
                    onSetRootBass: setBox,
                }}
            />);
            Simulate.change(
                findOneWithTag(
                    findOneWithType(component, StackedNoteInput), 'input'),
                { target: { value: 'D5' } });
            expect(getBox()).to.equal(14);
        });
        it("sets the infinite levels", () => {
            const {getBox, setBox} = makeBox(2.7);
            const component = renderIntoDocument(<ViewOptions
                {...baseProps}
                values={{
                    ...baseValues,
                    infiniteLevels: getBox(),
                }}
                handlers={{
                    ...baseHandlers,
                    onSetInfiniteLevels: setBox,
                }}
            />);
            Simulate.change(
                scryManyWithTag(component, 'input')
                    .filter(x => x.id === 'depth')[0],
                { target: { valueAsNumber: 1.2 } });
            expect(getBox()).to.equal(1.2);
        });
        it("sets the infinite height", () => {
            const {getBox, setBox} = makeBox(350);
            const component = renderIntoDocument(<ViewOptions
                {...baseProps}
                values={{
                    ...baseValues,
                    infiniteHeight: getBox(),
                }}
                handlers={{
                    ...baseHandlers,
                    onSetInfiniteHeight: setBox,
                }}
            />);
            Simulate.change(
                scryManyWithTag(component, 'input')
                    .filter(x => x.id === 'height')[0],
                { target: { valueAsNumber: 456 } });
            expect(getBox()).to.equal(456);
        });
        it("sets the rainbow factor", () => {
            const {getBox, setBox} = makeBox(0.1);
            const component = renderIntoDocument(<ViewOptions
                {...baseProps}
                values={{
                    ...baseValues,
                    rainbowFactor: getBox(),
                }}
                handlers={{
                    ...baseHandlers,
                    onSetRainbowFactor: setBox,
                }}
            />);
            Simulate.click(
                findOneWithClass(component, 'btn-group')
                    .getElementsByTagName('button')[3]);
            Simulate.change(
                scryManyWithTag(component, 'input')
                    .filter(x => x.id === 'rainbowFactor')[0],
                { target: { valueAsNumber: 0.15 } });
            expect(getBox()).to.equal(0.15);
        });
    });

});
