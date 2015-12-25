import {describe, it} from 'mocha';
import {expect} from 'chai';

import * as TestUtils from './TestUtils';

describe('TestUtils', () => {

    describe('makeBox', () => {
        const {makeBox} = TestUtils;

        it("returns two functions 'getBox' and 'setBox'", () =>
            expect(makeBox()).to.have.keys('getBox', 'setBox'));
        it("provides a default initial state of null", () =>
            expect(makeBox().getBox()).to.equal(null));
        it("allows setting a custom initial state", () =>
            expect(makeBox(77).getBox()).to.equal(77));

        const {getBox, setBox} = makeBox();
        it("sets the value once", () => {
            setBox(1);
            expect(getBox()).to.equal(1);
        });
        it("sets the value again", () => {
            setBox(22);
            expect(getBox()).to.equal(22);
        });
    });

    describe('mocking', () => {
        const {mocking} = TestUtils;
        const target = { foo: 77 };
        it("overwrites and restores a property that already exists", () => {
            expect(target.foo).to.equal(77);
            mocking(target, 'foo', 88, () => expect(target.foo).to.equal(88));
            expect(target.foo).to.equal(77);
        });
        it("sets up and tears down a new property name", () => {
            expect(target.foo).to.not.contain.key('bar');
            mocking(target, 'bar', 88, () => expect(target.bar).to.equal(88));
            expect(target.foo).to.not.contain.key('bar');
        });
    });

    describe('declareMochaMock', () => {
        const target = { foo: 123 };
        describe("should not take effect before the mock is declared", () => {
            it("for 'target.foo'", () =>
                expect(target.foo).to.equal(123));
            it("for 'target.bar'", () =>
                expect(target).to.not.have.property('bar'));
        });
        describe("should take effect while the mock is declared", () => {
            TestUtils.declareMochaMock(target, 'foo', 234);
            TestUtils.declareMochaMock(target, 'bar', 345);
            it("for 'target.foo'", () =>
                expect(target.foo).to.equal(234));
            it("for 'target.bar'", () =>
                expect(target.bar).to.equal(345));
        });
        describe("should not take effect after the mock is declared", () => {
            it("for 'target.foo'", () =>
                expect(target.foo).to.equal(123));
            it("for 'target.bar'", () =>
                expect(target).to.not.have.property('bar'));
        });
    });

});
