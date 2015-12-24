import {describe, describe as context, it} from 'mocha';
import {expect} from 'chai';

import * as CanvasCore from '../../src/core/CanvasCore';

import {initialState as initialReduxState} from '../TestData';
const {treeViewOptions: initialViewOptions} = initialReduxState;

describe('CanvasCore', () => {

    // Utilities for generating the initial canvas state,
    // optionally setting the view options as well.
    const s0 = () => CanvasCore.initialState();
    const s0v = (v = initialViewOptions) => CanvasCore.setViewOptions(s0(), v);

    it("provides an initial state", () =>
        expect(s0()).to.be.an('object'));

    it("sets the view options", () => {
        const initialState = s0v();
        expect(initialState.viewOptions).to.be.an('object');
        const newViewOptions = {
            ...initialViewOptions,
            infiniteLevels: 3.14,
        };
        const newState = s0v(newViewOptions);
        expect(newState.viewOptions).to.be.an('object');
        expect(newState.viewOptions).to.deep.equal(newViewOptions);
    });

    it("sets the canvas dimensions", () => {
        const newState = CanvasCore.setCanvasDimensions(s0v(), 123, 456);
        expect(newState.canvasDimensions.width).to.equal(123);
        expect(newState.canvasDimensions.height).to.equal(456);
        expect(newState.viewOptions).to.deep.equal(initialViewOptions);
    });

    it("gets the row dimensions, in canvas coordinates", () => {
        const initialState = CanvasCore.setViewOptions(
            CanvasCore.initialState(),
            { ...initialViewOptions, infiniteLevels: 3.5 });
        expect(initialState.canvasDimensions.width).to.equal(800);
        expect(initialState.canvasDimensions.height).to.equal(600);
        expect(CanvasCore.getRowDimensions(initialState)).to.deep.equal({
            width: 800,
            height: 600 / 3.5,
        });
    });

    it("provides a reasonable value for the maximum safe row", () => {
        const maxSafeRow = CanvasCore.getMaxSafeRow();
        expect(maxSafeRow).to.be.a('number');
        expect(maxSafeRow).to.be.at.least(25);
        expect(maxSafeRow).to.be.at.most(75);
    });

    describe("#getScalingFactor", () => {
        const {getScalingFactor, getScalingFactorForHeight} = CanvasCore;
        it("of 1\u00D7 when at the top", () =>
            expect(getScalingFactorForHeight(0)).to.equal(1));
        it("of 2\u00D7 when one row down", () =>
            expect(getScalingFactorForHeight(1)).to.equal(2));
        it("of 4\u00D7 when two rows down", () =>
            expect(getScalingFactorForHeight(2)).to.equal(4));
        it("of 1\u00D7 given the initial state", () =>
            expect(getScalingFactor(s0v())).to.equal(1));
    });

    describe("#getPanResult", () => {
        const {getPanResult} = CanvasCore;
        const xy = (x, y) => ({ x, y });
        //
        // Fix some dimensions so we get predictable results.
        const state = {
            ...CanvasCore.setCanvasDimensions(s0v({
                ...initialViewOptions,
                infiniteLevels: 4,
            }), 600, 400),
        };
        //
        // Allow overriding the (actually internal) 'position' field.
        const sp = position => ({ ...state, position });
        //
        context("retains the initial state when the displacement", () => {
            const none = xy(0, 0);
            it("is horizontal", () =>
                expect(getPanResult(state, xy(100, 0))).to.deep.equal(none));
            it("points upward", () =>
                expect(getPanResult(state, xy(0, -50))).to.deep.equal(none));
            it("points upward and to the right", () =>
                expect(getPanResult(state, xy(50, -50))).to.deep.equal(none));
        });
        context("pans straight down", () => {
            // test4: test panning down by four different distances
            const test4 = (initialPosition) => {
                const baseState = sp(initialPosition);
                const {x: initialX, y: initialY} = initialPosition;
                const test1 = (deltaCanvas, deltaPosition) =>
                    expect(getPanResult(baseState, xy(0, deltaCanvas)))
                        .to.deep.equal(xy(initialX, initialY + deltaPosition));
                it("by half a level",       () => test1(50,  0.5));
                it("by a single level",     () => test1(100, 1));
                it("by a level and a half", () => test1(150, 1.5));
                it("by two levels",         () => test1(200, 2));
            };
            context("from the initial state, ", () =>
                test4({ x: 0, y: 0 }));
            context("from a state that's already panned down, ", () =>
                test4({ x: 0, y: 0.75 }));
            context("from a state that's already panned diagonally, ", () =>
                test4({ x: 0.1, y: 0.75 }));
        });
    });

});
