import {describe, it} from 'mocha';
import {expect} from 'chai';

import Folding from '../src/Folding';

describe('Folding', () => {

    describe('#outfoldUp', () => {
        const {outfoldUp} = Folding;
        const test = (input, output) =>
            () => expect(outfoldUp(input)).to.deep.equal(output);

        it("folds [0, 4, 7] up to [0, 7, 10]",
            test([0, 4, 7], [0, 7, 10]));
        it("folds [0, 7, 10] up to [0, 10, 13]",
            test([0, 7, 10], [0, 10, 13]));
    });

    describe('#outfoldDown', () => {
        const {outfoldDown} = Folding;
        const test = (input, output) =>
            () => expect(outfoldDown(input)).to.deep.equal(output);

        it("folds [0, 4, 7] down to [-4, 0, 7]",
            test([0, 4, 7], [-4, 0, 7]));
        it("folds [-4, 0, 7] down to [-8, -4, 7]",
            test([-4, 0, 7], [-8, -4, 7]));
    });

    describe('#infoldCanonical', () => {
        const {infoldCanonical} = Folding;
        const test = (input, output) =>
            () => expect(infoldCanonical(input)).to.deep.equal(output);

        it("folds [0, 4, 7] down to [0, 1, 4]",
            test([0, 4, 7], [0, 1, 4]));
        it("folds [0, 3, 7] up to [3, 6, 7]",
            test([0, 3, 7], [3, 6, 7]));

        it("folds [5, 9, 16] up to [9, 13, 16]",
            test([5, 9, 16], [9, 13, 16]));
        it("folds [5, 12, 16] down to [5, 8, 12]",
            test([5, 12, 16], [5, 8, 12]));
    });

});
