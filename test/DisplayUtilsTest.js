import {describe, it} from 'mocha';
import {expect} from 'chai';

import * as DisplayUtils from '../src/DisplayUtils';

describe('DisplayUtils', () => {

    describe('#withinLimits', () => {
        const {withinLimits} = DisplayUtils;
        const gdb = [7, 10, 14];

        const makeLimits = (ni, xi, nc, xc, disabled = {}) => ({
            minIndividual: ni,
            minIndividualEnabled: !disabled.ni,
            maxIndividual: xi,
            maxIndividualEnabled: !disabled.xi,
            minCombined: nc,
            minCombinedEnabled: !disabled.nc,
            maxCombined: xc,
            maxCombinedEnabled: !disabled.xc,
        });
        const test = (expected, input, ...argsToMakeLimits) =>
            expect(withinLimits(input, makeLimits(...argsToMakeLimits)))
                .to.equal(expected);

        it("accepts a chord when the limits object is falsy", () =>
            expect(withinLimits(gdb, null)).to.equal(true));
        it("accepts a chord within limits", () =>
            test(true, gdb, 1, 8, 3, 15));
        it("accepts a chord within limits, with some disabled", () =>
            test(true, gdb, 1, 8, 3, 15, {ni: true, xc: true}));
        it("accepts a chord within limits, with all disabled", () =>
            test(true, gdb, 1, 8, 3, 15,
                {ni: true, xi: true, nc: true, xc: true}));

        it("accepts a chord barely passing the minIndividual limit", () =>
            test(true, gdb, 3, 8, 3, 15));
        it("rejects a chord barely failing the minIndividual limit", () =>
            test(false, gdb, 4, 8, 3, 15));
        it("rejects a chord failing the minIndividual limit", () =>
            test(false, gdb, 5, 8, 3, 15));
        it("accepts a chord failing the disabled minIndividual limit", () =>
            test(true, gdb, 5, 8, 3, 15, {ni: true}));

        it("accepts a chord barely passing the maxIndividual limit", () =>
            test(true, gdb, 1, 4, 3, 15));
        it("rejects a chord barely failing the maxIndividual limit", () =>
            test(false, gdb, 1, 3, 3, 15));
        it("rejects a chord failing the maxIndividual limit", () =>
            test(false, gdb, 1, 2, 3, 15));
        it("accepts a chord failing the disabled maxIndividual limit", () =>
            test(true, gdb, 1, 2, 3, 15, {xi: true}));

        it("accepts a chord barely passing the minCombined limit", () =>
            test(true, gdb, 1, 8, 7, 15));
        it("rejects a chord barely failing the minCombined limit", () =>
            test(false, gdb, 1, 8, 8, 15));
        it("rejects a chord failing the minCombined limit", () =>
            test(false, gdb, 1, 8, 9, 15));
        it("accepts a chord failing the disabled minCombined limit", () =>
            test(true, gdb, 1, 8, 9, 15, {nc: true}));

        it("accepts a chord barely passing the maxCombined limit", () =>
            test(true, gdb, 1, 8, 3, 7));
        it("rejects a chord barely failing the maxCombined limit", () =>
            test(false, gdb, 1, 8, 3, 6));
        it("rejects a chord failing the maxCombined limit", () =>
            test(false, gdb, 1, 8, 3, 5));
        it("accepts a chord failing the disabled maxCombined limit", () =>
            test(true, gdb, 1, 8, 3, 5, {xc: true}));
    });

});
