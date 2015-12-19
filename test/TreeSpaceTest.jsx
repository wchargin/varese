import {describe, it} from 'mocha';
import {expect} from 'chai';

import TreeSpace from '../src/TreeSpace';

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

    describe('#positionToSemitones', () => {
        const {positionToSemitones} = TreeSpace;
        const test = (r, a, b, output) => () =>
            expect(positionToSemitones(r, a, b)).to.deep.equal(output);

        it("finds the root of T(1)", test(1, 0, 0, [1, 1]));
        it("finds the root of T(7)", test(7, 0, 0, [7, 7]));
        it("finds [3][4], the LLR child of T(1)", test(1, 3, 1, [4, 3]));
        it("finds [6][10], the LLR child of T(2)", test(2, 3, 1, [8, 6]));
        it("finds [15][24], the RLRL child of T(3)", test(3, 4, 10, [15, 24]));
        it("returns null when the column is too small", test(1, 3, -1, null));
        it("returns null when the column is too big", test(1, 3, 8, null));
    });

});
