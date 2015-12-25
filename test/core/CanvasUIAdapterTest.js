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
