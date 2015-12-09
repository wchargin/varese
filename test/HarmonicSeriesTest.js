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

    describe("#temperExact", () => {
        const {temperExact} = HarmonicSeries;
        const epsilon = 1e-4;

        it("should give  0.0000 for the fundamental itself", () =>
            expect(temperExact(1)).to.be.closeTo(0.0000, epsilon));
        it("should give 12.0000 for the second overtone", () =>
            expect(temperExact(2)).to.be.closeTo(12.0000, epsilon));
        it("should give 19.0196 for the third overtone", () =>
            expect(temperExact(3)).to.be.closeTo(19.0196, epsilon));
        it("should give 24.0000 for the fourth overtone", () =>
            expect(temperExact(4)).to.be.closeTo(24.0000, epsilon));
        it("should give 27.8631 for the fifth overtone", () =>
            expect(temperExact(5)).to.be.closeTo(27.8631, epsilon));
    });

    describe("#temper", () => {
        const {temper} = HarmonicSeries;

        it("should give  0 for the fundamental itself", () =>
            expect(temper(1)).to.equal(0));
        it("should give 12 for the the second overtone", () =>
            expect(temper(2)).to.equal(12));
        it("should give 19 for the the third overtone", () =>
            expect(temper(3)).to.equal(19));
        it("should give 24 for the the fourth overtone", () =>
            expect(temper(4)).to.equal(24));
        it("should give 28 for the the fifth overtone", () =>
            expect(temper(5)).to.equal(28));
    });

    describe("#findRootOffset", () => {
        const {findRootOffset, canonicalRationalizer: cr} = HarmonicSeries;

        it("should resolve high-A-to-C to root at 15vb-F", () =>
            expect(findRootOffset(cr, 9, 12)).to.equal(5 - 24));
        it("should resolve C-to-high-E to root at 8vb-C", () =>
            expect(findRootOffset(cr, 12, 28)).to.equal(0));
        it("should resolve E-to-G to root at 15vb-C", () =>
            expect(findRootOffset(cr, 4, 7)).to.equal(-24));
        it("should resolve unison to itself", () =>
            expect(findRootOffset(cr, 99, 99)).to.equal(99));
    });

    describe("#findChordRootOffset", () => {
        const {
            findChordRootOffset,
            canonicalRationalizer: cr,
        } = HarmonicSeries;

        it("should resolve a single-note \"chord\" to itself", () =>
            expect(findChordRootOffset(cr, [77])).to.equal(77));
        it("should resolve a binary chord to just the interval root", () =>
            expect(findChordRootOffset(cr, [9, 12])).to.equal(5 - 24));

        it("should resolve C-E-G to 15vb-C", () =>
            expect(findChordRootOffset(cr, [0, 4, 7])).to.equal(-24));
        it("should resolve C-E-G-B to 22vb-C", () =>
            expect(findChordRootOffset(cr, [0, 4, 7, 11])).to.equal(-36));
        it("should resolve C-F-A to 15vb-F", () =>
            expect(findChordRootOffset(cr, [0, 5, 9])).to.equal(5 - 24));
        it("should resolve Eb-A-D to 5x8vb-Db", () =>
            expect(findChordRootOffset(cr, [3, 9, 14])).to.equal(1 - 5 * 12));
    });

    describe("#canonicalRationalizer", () => {
        const {canonicalRationalizer: cr} = HarmonicSeries;

        it("should map the tritone to 12:17", () =>
            expect(cr(6)).to.deep.equal(new Rational(12, 17)));
        it("should map the perfect fifth to 2:3", () =>
            expect(cr(7)).to.deep.equal(new Rational(2, 3)));
        it("should map the 1-compound perfect fifth to 1:3", () =>
            expect(cr(7 + 12)).to.deep.equal(new Rational(1, 3)));
        it("should map the 2-compound perfect fifth to 1:6", () =>
            expect(cr(7 + 24)).to.deep.equal(new Rational(1, 6)));
    });

});