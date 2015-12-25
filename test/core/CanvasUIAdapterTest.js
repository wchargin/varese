import {describe, it} from 'mocha';
import {expect} from 'chai';

import {makeBox} from '../TestUtils';

import {createHandlers, initialState} from '../../src/core/CanvasUIAdapter';

describe('CanvasUIAdapter', () => {

    const create = () => {
        const {getBox, setBox} = makeBox(initialState());
        return { getBox, setBox, handlers: createHandlers(getBox, setBox) };
    };

    describe('#initialState', () => {
        it("should be a function", () =>
            expect(initialState).to.be.a('function'));
        it("should return an object", () =>
            expect(initialState()).to.be.an('object'));
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

});
