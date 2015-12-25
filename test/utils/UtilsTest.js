import {describe, describe as context, it} from 'mocha';
import {expect} from 'chai';

import * as Utils from '../../src/utils/Utils';

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

    describe('#range', () => {
        const {range} = Utils;
        const test = (...args) => (...expected) =>
            expect(range(...args)).to.deep.equal(expected);
        context("with one argument", () => {
            it("generates a simple exclusive range", () => test(3)(0, 1, 2));
            it("generates the singleton range", () => test(1)(0));
            it("generates the empty range at 0", () => test(0)());
            it("generates the empty range at -1", () => test(-1)());
            it("generates the empty range at -77", () => test(-77)());
            it("complains for a non-numeric argument", () =>
                expect(() => range("two")).to.throw(/numeric/));
            it("complains for an infinite argument", () =>
                expect(() => range(Infinity)).to.throw(/finite/));
        });
        context("with two arguments", () => {
            it("generates a range from 0 to 3", () => test(0, 3)(0, 1, 2));
            it("generates a range from 1 to 3", () => test(1, 3)(1, 2));
            it("generates a range from -1 to 2", () => test(-1, 2)(-1, 0, 1));
            it("generates an empty range from 5 to 5", () => test(5, 5)());
            it("generates an empty range from 5 to -5", () => test(5, -5)());
            it("complains for a non-numeric argument", () =>
                expect(() => range(1, "two")).to.throw(/numeric/));
            it("complains for an infinite argument", () =>
                expect(() => range(1, Infinity)).to.throw(/finite/));
        });
        context("with three arguments", () => {
            it("generates a range from 0 to 5 by 2", () =>
                test(0, 5, 2)(0, 2, 4));
            it("generates a range from 0 to 6 by 2 (exclusively)", () =>
                test(0, 6, 2)(0, 2, 4));
            it("generates a range from 0 to 7 by 2", () =>
                test(0, 7, 2)(0, 2, 4, 6));
            it("generates a range from 10 to 20 by 3", () =>
                test(10, 20, 3)(10, 13, 16, 19));
            it("generates a range from -5 to 5 by 2", () =>
                test(-5, 5, 2)(-5, -3, -1, 1, 3));
            it("generates a range from 5 to -5 by -2", () =>
                test(5, -5, -2)(5, 3, 1, -1, -3));
            it("generates an empty range from 5 to -5 by 2", () =>
                test(5, -5, 2)());
            it("generates an empty range from -5 to 5 by -2", () =>
                test(5, -5, 2)());
            it("generates a range from 0 to 2 by 0.25", () =>
                test(0, 2, 0.25)(0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75));
            it("complains when the step size is zero", () =>
                expect(() => range(1, 2, 0)).to.throw(/step/));
            it("complains when the step size is negative zero", () =>
                expect(() => range(1, 2, -0)).to.throw(/step/));
            it("complains for a non-numeric argument", () =>
                expect(() => range(0, 1, "two")).to.throw(/numeric/));
            it("complains for an infinite argument", () =>
                expect(() => range(0, 1, Infinity)).to.throw(/finite/));
        });
        context("with other numbers of arguments", () =>
            [0, 4, 5].forEach(arity =>
                it("fails when the arity is " + arity, () =>
                    expect(() => range(...Array(arity))).to.throw(/arity/))));
    });

    describe('#buildArray', () => {
        const {buildArray} = Utils;
        const test = (...args) => (...expected) =>
            expect(buildArray(...args)).to.deep.equal(expected);
        it("works for an empty array", () =>
            test(0, x => x)());
        it("works for a length-3 identity array", () =>
            test(3, x => x)(0, 1, 2));
        it("works for a length-3 array of strings", () =>
            test(3, x => Array(x + 1).join("z"))("", "z", "zz"));
        it("works for the square numbers example", () =>
            test(5, x => x * x)(0, 1, 4, 9, 16));
        it("works for the self-reference example", () =>
            test(5, (i, r) => (r[i - 1] || 0) + i)(0, 1, 3, 6, 10));
    });

    describe('#arraysEqual', () => {
        const {arraysEqual} = Utils;

        const arr1 = [1, 2, 3];
        it("works for identical arrays", () =>
            expect(arraysEqual(arr1, arr1)).to.be.true);
        it("works for non-identical but equal arrays", () =>
            expect(arraysEqual(arr1, [1, 2, 3])).to.be.true);

        it("fails when the first array is longer", () =>
            expect(arraysEqual(arr1, [1, 2])).to.be.false);
        it("fails when the first array is shorter", () =>
            expect(arraysEqual(arr1, [1, 2, 3, 4])).to.be.false);
        it("fails when the first element differs", () =>
            expect(arraysEqual(arr1, [8, 2, 3])).to.be.false);
        it("fails when the middle element differs", () =>
            expect(arraysEqual(arr1, [1, 8, 3])).to.be.false);
        it("fails when the last element differs", () =>
            expect(arraysEqual(arr1, [1, 2, 8])).to.be.false);

        const neq = (a, b) => a !== b;
        it("works with a non-standard comparator in the positive case", () =>
            expect(arraysEqual(arr1, [2, 3, 4], neq)).to.be.true);
        it("works with a non-standard comparator in the negative case", () =>
            expect(arraysEqual(arr1, [3, 2, 1], neq)).to.be.false);

        const nest = (a, b) => arraysEqual(a, b);
        it("works with itself as the comparator in the positive case", () =>
            expect(arraysEqual([[1, 2], [3, 4]], [[1, 2], [3, 4]], nest))
                .to.be.true);
        it("works with itself as the comparator in the negative case", () =>
            expect(arraysEqual([[1, 2], [3, 4]], [[1, 2], [3, 8]], nest))
                .to.be.false);

        // This one's more just for fun...
        const improve = f => (a, b) => {
            const [arrA, arrB] = [a, b].map(arr => Array.isArray(arr));
            if (arrA && arrB) {
                return arraysEqual(a, b, f);
            } else if (!arrA && !arrB) {
                return a === b;
            } else {
                return false;
            }
        };
        const fix = (f => f(f))(f => improve((a, b) => f(f)(a, b)));
        it("works with the fixed point of itself in the positive case", () =>
            expect(arraysEqual([1, [2, [3, [4]]]], [1, [2, [3, [4]]]], fix))
                .to.be.true);
        it("works with the fixed point of itself in the negative case", () =>
            expect(arraysEqual([1, [2, [3, [4]]]], [1, [2, [8, [4]]]], fix))
                .to.be.false);
    });

    describe('#flatten', () => {
        const {flatten} = Utils;

        it("flattens one level of arrays", () =>
            expect(flatten([[1, 2], [3, 4, 5, 6]]))
                .to.deep.equal([1, 2, 3, 4, 5, 6]));
        it("flattens just one level of arrays", () =>
            expect(flatten([[1, 2], [[3, 4], [5, 6]]]))
                .to.deep.equal([1, 2, [3, 4], [5, 6]]));
        it("does nothing to the empty array", () =>
            expect(flatten([])).to.deep.equal([]));
        it("collapses the array of the empty array to the empty array", () =>
            expect(flatten([[]])).to.deep.equal([]));
    });

});
