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

});
