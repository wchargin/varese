import {describe, it} from 'mocha';
import {expect} from 'chai';

import * as CanvasCore from '../../src/core/CanvasCore';

import {initialState as initialReduxState} from '../TestData';
const {treeViewOptions: initialViewOptions} = initialReduxState;

describe('CanvasCore', () => {

    it("provides an initial state", () =>
        expect(CanvasCore.initialState()).to.be.an('object'));

    it("sets the view options", () => {
        const initialState = CanvasCore.setViewOptions(
            CanvasCore.initialState(),
            initialViewOptions);
        expect(initialState.viewOptions).to.be.an('object');
        const newViewOptions = {
            ...initialViewOptions,
            infiniteLevels: 3.14,
        };
        const newState = CanvasCore.setViewOptions(
            CanvasCore.initialState(),
            newViewOptions);
        expect(newState.viewOptions).to.be.an('object');
        expect(newState.viewOptions).to.deep.equal(newViewOptions);
    });

});
