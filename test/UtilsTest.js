import {describe, it} from 'mocha';
import {expect} from 'chai';

import Utils from '../src/Utils';

describe('Utils', () => {

    describe('#gcd(a, b)', () => {
        const {gcd} = Utils;

        it("works when a divides b and a < b",
            () => expect(gcd(5, 15)).to.equal(5));
        it("works when a does not divide b and a < b",
            () => expect(gcd(10, 15)).to.equal(5));
        it("works when a and b are coprime and a < b",
            () => expect(gcd(15, 19)).to.equal(1));

        it("works when a === b",
            () => expect(gcd(193, 193)).to.equal(193));

        it("works when b divides a and a > b",
            () => expect(gcd(24, 6)).to.equal(6));
        it("works when b does not divide a and a > b",
            () => expect(gcd(24, 9)).to.equal(3));
        it("works when a and b are coprime and a > b",
            () => expect(gcd(24, 17)).to.equal(1));

        it("indicates that gcd(0, 0) === 0",
            () => expect(gcd(0, 0)).to.equal(0));

        it("gives a positive result when a < 0 < b",
            () => expect(gcd(-5, 15)).to.equal(5));
        it("gives a positive result when b < 0 < a",
            () => expect(gcd(5, -15)).to.equal(5));
        it("gives a positive result when a < b < 0",
            () => expect(gcd(-15, -5)).to.equal(5));
        it("gives a positive result when b < a < 0",
            () => expect(gcd(-5, -15)).to.equal(5));
    });

});
