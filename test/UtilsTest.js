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

});
