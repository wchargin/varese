import {describe, it} from 'mocha';
import {expect} from 'chai';

import Rational from '../../src/core/Rational';

describe('Rational', () => {

    describe('#constructor', () => {
        it("creates new Rational objects", () => {
            const r = new Rational(3, 2);
            expect(r).to.be.an.instanceof(Rational);
            expect(r.a).to.equal(3);
            expect(r.b).to.equal(2);
        });
        it("complains when the denominator is zero",
            () => expect(() => new Rational(1, 0)).to.throw(/zero/));
        it("reduces the fractions",
            () => expect(new Rational(8, 6).a).to.equal(4));
        it("allows negatives in the first term", () => {
            const r = new Rational(-5, 3);
            expect(r.a).to.equal(-5);
            expect(r.b).to.equal(3);
        });
        it("normalizes negatives in the second term", () => {
            const r = new Rational(5, -3);
            expect(r.a).to.equal(-5);
            expect(r.b).to.equal(3);
        });

        it("rejects an infinity in the numerator",
            () => expect(() => new Rational(Infinity, 1))
                .to.throw(/numerator/));
        it("rejects an infinity in the denominator",
            () => expect(() => new Rational(1, Infinity))
                .to.throw(/denominator/));
        it("rejects an infinite quotient of finite numbers", () => {
            const superSmall = 1e-313;
            expect(superSmall !== 0).to.equal(true);
            expect(isFinite(superSmall)).to.equal(true);
            expect(() => new Rational(1, superSmall))
                .to.throw(/finite quotient/);
        });
    });

    describe('#equals', () => {
        it("compares for equality",
            () => expect(new Rational(8, 6).equals(new Rational(4, 3)))
                .to.be.true);
        it("compares for inequality",
            () => expect(new Rational(8, 6).equals(new Rational(5, 3)))
                .to.be.false);
    });

    describe('#multiply', () => {
        it("multiplies things that would simplify",
            () => expect(new Rational(8, 6).multiply(new Rational(4, 2))
                .equals(new Rational(8, 3))).to.be.true);
        it("multiplies things that would complicate",
            () => expect(new Rational(8, 6).multiply(new Rational(5, 17))
                .equals(new Rational(20, 51))).to.be.true);
        it("multiplies to zero",
            () => expect(new Rational(17, 11).multiply(new Rational(0, 12))
                .equals(new Rational(0, 1))).to.be.true);
    });

    describe('#exponentiateScalar', () => {
        const exp57 = k => new Rational(5, 7).exponentiateScalar(k);
        it("exponentiates to the power of 2",
            () => expect(exp57(2).equals(new Rational(25, 49)))
                .to.be.true);
        it("exponentiates to the power of 1 (identity)",
            () => expect(exp57(1).equals(new Rational(5, 7))).to.be.true);
        it("exponentiates to the power of 0 (projection)",
            () => expect(exp57(0).equals(new Rational(1, 1))).to.be.true);
        it("exponentiates to the power of -1 (reciprocal)",
            () => expect(exp57(-1).equals(new Rational(7, 5))).to.be.true);
        it("exponentiates to the power of -2",
            () => expect(exp57(-2).equals(new Rational(49, 25)))
                .to.be.true);

        const exp0 = k => new Rational(0, 1).exponentiateScalar(k);
        it("lets 0^88 = 0",
            () => expect(exp0(88).equals(new Rational(0, 1))).to.be.true);
        it("lets 0^0 = 1",
            () => expect(exp0(0).equals(new Rational(1, 1))).to.be.true);
    });

    describe("#toNumber", () => {
        it("converts zero to a number",
            () => expect(new Rational(0, 12).toNumber()).to.equal(0));
        it("converts (7 / 1) to a number",
            () => expect(new Rational(7, 1).toNumber()).to.equal(7));
        it("converts (7 / 4) to a number",
            () => expect(new Rational(7, 4).toNumber()).to.equal(7 / 4));
    });

});
