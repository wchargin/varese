import {describe, it} from 'mocha';
import {expect} from 'chai';

import {makeBox} from '../TestUtils';
import {initialState as initialReduxState} from '../TestData';
const {treeViewOptions: initialViewOptions} = initialReduxState;

import * as CanvasCore from '../../src/core/CanvasCore';
import {createHandlers, initialState} from '../../src/core/CanvasUIAdapter';

describe('CanvasUIAdapter', () => {
    // Fix some dimensions so we get predictable results.
    const baseDimensions = { width: 600, height: 400 };
    const baseViewOptions = {
        ...initialViewOptions,
        infiniteLevels: 4,
        infiniteHeight: baseDimensions.height,
    };
    //
    // Utilities for generating the initial canvas state
    // and setting the view options.
    const s0 = (viewOptions = baseViewOptions) =>
        CanvasCore.setViewOptions(
            CanvasCore.setCanvasWidth(
                CanvasCore.initialState(),
                baseDimensions.width),
            viewOptions);
    //
    // Allow overriding the (actually internal) 'position' field.
    const sp = (position, state = s0()) => ({ ...state, position });
    //
    // ...and do so easily with a helper function to save some typing.
    const xy = (x, y) => ({ x, y });

    const create = () => {
        const {getBox, setBox} = makeBox(initialState(s0()));
        return { getBox, setBox, handlers: createHandlers(getBox, setBox) };
    };

    describe('#initialState', () => {
        const coreState = s0();
        it("should be a function", () =>
            expect(initialState).to.be.a('function'));
        it("should return an object", () =>
            expect(initialState(coreState)).to.be.an('object'));
        it("should have a 'coreState' matching the input", () =>
            expect(initialState(coreState))
                .to.have.property('coreState')
                .that.deep.equals(coreState));
    });

    describe('#createHandlers', () => {
        it("should be a function", () =>
            expect(createHandlers).to.be.a('function'));
        it("should return an object", () =>
            expect(create()).to.be.an('object'));
        it("should return an object with at least one property", () =>
            expect(Object.keys(create().handlers)).to.have.length.at.least(1));
        it("should return an object all of whose values are functions", () => {
            const handlers = create().handlers;
            Object.keys(handlers).forEach(key =>
                expect(handlers[key]).to.be.a('function'));
        });
    });

    describe('handler onMouseDown', () => {
        const {getBox, handlers} = create();
        it("should be initialized with 'mouseDown' as false", () =>
            expect(getBox().mouseDown).to.equal(false));
        it("should set 'mouseDown' to true when false", () => {
            handlers.onMouseDown({});
            expect(getBox().mouseDown).to.equal(true);
        });
        it("should leave 'mouseDown' as true when already true", () => {
            handlers.onMouseDown({});
            expect(getBox().mouseDown).to.equal(true);
        });
    });

});
