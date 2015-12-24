import {describe, it} from 'mocha';
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

});
