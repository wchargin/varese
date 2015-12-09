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

});
