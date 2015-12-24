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

});
