import {describe, describe as context, it} from 'mocha';
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

    describe('#formatMaybeRoot', () => {
        const {formatMaybeRoot: fmr} = DisplayUtils;
        const yes = result => ({ status: "success", result });
        const no  = error  => ({ status: "error", error });

        const show = { showOctaves: true };
        const hide = { showOctaves: false };

        it("properly formats a chord with octaves displayed", () =>
            expect(fmr(yes(6), show)).to.equal("F\u266F4"));
        it("properly formats a chord with octaves hidden", () =>
            expect(fmr(yes(6), hide)).to.equal("F\u266F"));
        it("properly formats a missing root due to a singularity", () =>
            expect(fmr(no('finite'), show)).to.equal("?"));
        it("properly formats a missing root due to a zero ratio", () =>
            expect(fmr(no('zero_ratio'), show)).to.equal("?"));
        it("gives up upon encountering an unexpected error message", () =>
            expect(() => fmr(no('ragnarok'), show)).to.throw(/ragnarok/));
    });

    describe('#formatMaybeRoot', () => {
        const {formatPitchesAndSemitones: fps} = DisplayUtils;

        const dfsa = [2, 6, 9];  // D4, F#4, A4
        const withOctaves    = (notes = dfsa) =>
            fps(notes, { showOctaves: true });
        const withoutOctaves = (notes = dfsa) =>
            fps(notes, { showOctaves: false });

        context("when octaves should be shown", () => {
            it("formats note names", () =>
                expect(withOctaves().noteNames)
                    .to.deep.equal(["D4", "F\u266F4", "A4"]));
            it("formats semitone names", () =>
                expect(withOctaves().semitoneNames)
                    .to.deep.equal(["[4]", "[3]"]));
        });

        context("when octaves should be hidden", () => {
            it("formats note names", () =>
                expect(withoutOctaves().noteNames)
                    .to.deep.equal(["D", "F\u266F", "A"]));
            it("formats semitone names", () =>
                expect(withoutOctaves().semitoneNames)
                    .to.deep.equal(["[4]", "[3]"]));
        });

        context("for chords with more than three notes", () => {
            it("formats note names", () =>
                expect(withoutOctaves([0, 2, 4, 5]).noteNames)
                    .to.deep.equal(["C", "D", "E", "F"]));
            it("formats semitone names", () =>
                expect(withoutOctaves([0, 2, 4, 5]).semitoneNames)
                    .to.deep.equal(["[2]", "[2]", "[1]"]));
        });

        it("uses a proper minus sign for negative semitones", () =>
            expect(withoutOctaves([1, 1, 0]).semitoneNames)
                .to.deep.equal(["[0]", "[\u22121]"]));
    });

});
