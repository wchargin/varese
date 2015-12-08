import {describe, it} from 'mocha';
import {expect} from 'chai';

import Rational from '../src/Rational';
import HarmonicSeries from '../src/HarmonicSeries';

describe('HarmonicSeries', () => {

    describe("#extendRationalizer", () => {
        const {extendRationalizer} = HarmonicSeries;

        it("should fail for undefined input", () =>
            expect(() => extendRationalizer()).to.throw(/array/));
        it("should fail for arrays that are too short", () =>
            expect(() => extendRationalizer(Array(10))).to.throw(/length/));
        it("should fail for arrays that are too short", () =>
            expect(() => extendRationalizer(Array(12))).to.throw(/length/));
        it("should fail for arrays with non-Rational contents", () =>
            expect(() => extendRationalizer(Array(11).fill(0.75)))
            .to.throw(/Rational/));

        // Use simple input: descend from 1 to 1/2 arithmetically.
        const input = [23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13].map(
            x => new Rational(x, 24));
        const rationalizer = extendRationalizer(input);

        it("should give a unit for the zero interval", () =>
            expect(rationalizer(0)).to.deep.equal(new Rational(1, 1)));
        it("should preserve the mappings in the original domain", () =>
            expect(rationalizer(3)).to.deep.equal(new Rational(21, 24)));
        it("should give a 1/2 for the upper octave", () =>
            expect(rationalizer(12)).to.deep.equal(new Rational(1, 2)));
        it("should extrapolate upward based on the original values", () =>
            expect(rationalizer(15)).to.deep.equal(new Rational(21, 48)));
        it("should extrapolate downward based on the original values", () =>
            expect(rationalizer(-9)).to.deep.equal(new Rational(21, 12)));

        it("should complain for non-integral values", () =>
            expect(() => rationalizer(1.5)).to.throw(/integer/));
        it("should complain for infinite values", () =>
            expect(() => rationalizer(-Infinity)).to.throw(/finite/));
        it("should complain for NaN values", () =>
            expect(() => rationalizer(NaN)).to.throw(/NaN/));
    });

});
