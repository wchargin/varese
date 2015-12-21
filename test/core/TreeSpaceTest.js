import {describe, it} from 'mocha';
import {expect} from 'chai';

import TreeSpace from '../../src/core/TreeSpace';

describe('TreeSpace', () => {

    describe('#positionToPath', () => {
        const {positionToPath} = TreeSpace;
        const [l, r] = ["left", "right"];
        const test = (a, b, output) => () =>
            expect(positionToPath(a, b, l, r)).to.deep.equal(output);

        it("finds the root with no path operations", test(0, 0, []));
        it("finds the left child of the root", test(1, 0, [l]));
        it("finds the right child of the root", test(1, 1, [r]));
        it("finds the LRL child of the root", test(3, 2, [l, r, l]));
        it("finds the RRR child of the root", test(3, 7, [r, r, r]));
        it("returns null when the column is too small", test(3, -1, null));
        it("returns null when the column is too big", test(3, 8, null));
    });

    describe('#positionToPitches', () => {
        const {positionToPitches} = TreeSpace;
        const test = (o, r, c, b, output) => () =>
            expect(positionToPitches(o, r, c, b)).to.deep.equal(output);

        it("finds the root of T(1) at C", test(1, 0, 0, 0, [0, 1, 2]));
        it("finds the root of T(7) at D", test(7, 0, 0, 2, [2, 9, 16]));
        it("finds [3][4] = [-2, 2, 5], the LLR child of T(1) at C",
            test(1, 3, 1, 0, [-2, 2, 5]));
        it("finds [6][10] = [-4, 4, 10], the LLR child of T(2) at C",
            test(2, 3, 1, 0, [-4, 4, 10]));
        it("finds [15][24] = [-21, -6, 18], the RLRL child of T(3) at C",
            test(3, 4, 10, 0, [-21, -6, 18]));
        it("returns null when the column is too small",
            test(1, 3, -1, 0, null));
        it("returns null when the column is too big",
            test(1, 3, 8, 0, null));
    });

});
