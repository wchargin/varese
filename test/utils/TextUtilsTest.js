import {describe, it} from 'mocha';
import {expect} from 'chai';

import TextUtils from '../../src/utils/TextUtils';

describe('TextUtils', () => {

    describe('#numberish', () => {
        const {numberish} = TextUtils;

        it("accepts  2", () => expect(numberish(2)).to.equal(2));
        it("accepts  1", () => expect(numberish(1)).to.equal(1));
        it("accepts  0", () => expect(numberish(0)).to.equal(0));
        it("accepts -1", () => expect(numberish(-1)).to.equal(-1));
        it("accepts -2", () => expect(numberish(-2)).to.equal(-2));

        it("accepts an array of length 2", () =>
            expect(numberish([5, 5])).to.equal(2));
        it("accepts an array of length 1", () =>
            expect(numberish([5])).to.equal(1));
        it("accepts an array of length 0", () =>
            expect(numberish([])).to.equal(0));

        it("rejects an object", () =>
            expect(() => numberish({})).to.throw(/not very number-like/));
        it("rejects a string", () =>
            expect(() => numberish("hi")).to.throw(/not very number-like/));
    });

    describe('#ngettext', () => {
        const {ngettext} = TextUtils;

        // Just adding 's'.
        it("works for  2 'emus'", () =>
            expect(ngettext(2, "emu", "emus")).to.equal("emus"));
        it("works for  1 'emu'", () =>
            expect(ngettext(1, "emu", "emus")).to.equal("emu"));
        it("works for  0 'emus'", () =>
            expect(ngettext(0, "emu", "emus")).to.equal("emus"));
        it("works for -1 'emu' (??)", () =>
            expect(ngettext(-1, "emu", "emus")).to.equal("emus"));
        it("works for -2 'emu' (????)", () =>
            expect(ngettext(-2, "emu", "emus")).to.equal("emus"));

        // Not just adding 's'.
        it("works for  2 'some'", () =>
            expect(ngettext(2, "one", "some")).to.equal("some"));
        it("works for  1 'one'", () =>
            expect(ngettext(1, "one", "some")).to.equal("one"));
        it("works for  0 'some'", () =>
            expect(ngettext(0, "one", "some")).to.equal("some"));
        it("works for -1 'one' (??)", () =>
            expect(ngettext(-1, "one", "some")).to.equal("some"));
        it("works for -2 'one' (????)", () =>
            expect(ngettext(-2, "one", "some")).to.equal("some"));

        // On arrays.
        it("works for an array of length 2", () =>
            expect(ngettext(["hi", null], "array element", "array elements"))
                .to.equal("array elements"));
        it("works for an array of length 1", () =>
            expect(ngettext([null], "array element", "array elements"))
                .to.equal("array element"));
        it("works for an array of length 0", () =>
            expect(ngettext([], "array element", "array elements"))
                .to.equal("array elements"));

        // For other languages with more contexts.
        const irish = ["clach", "clachan", { 2: "cloich" }];
        const rocks = n => Array(n).fill("rock");
        it("works for three Irish 'clachan' (stones)", () =>
            expect(ngettext(rocks(3), ...irish)).to.equal("clachan"));
        it("works for two Irish 'cloich' (stones)", () =>
            expect(ngettext(rocks(2), ...irish)).to.equal("cloich"));
        it("works for one Irish 'clach' (stone)", () =>
            expect(ngettext(rocks(1), ...irish)).to.equal("clach"));
        it("works for zero Irish 'clachan' (stones)", () =>
            expect(ngettext(rocks(0), ...irish)).to.equal("clachan"));
    });

    describe('#quantity', () => {
        const {quantity} = TextUtils;

        // Lightly tested because we assume it delegates to ngettext.
        const irish = ["clach", "clachan", { 2: "cloich" }];
        const rocks = n => Array(n).fill("rock");
        it("works for three Irish 'clachan' (stones)", () =>
            expect(quantity(rocks(3), ...irish)).to.equal("3 clachan"));
        it("works for two Irish 'cloich' (stones)", () =>
            expect(quantity(rocks(2), ...irish)).to.equal("2 cloich"));
        it("works for one Irish 'clach' (stone)", () =>
            expect(quantity(rocks(1), ...irish)).to.equal("1 clach"));
        it("works for zero Irish 'clachan' (stones)", () =>
            expect(quantity(rocks(0), ...irish)).to.equal("0 clachan"));
    });

    describe('#list', () => {
        const {list} = TextUtils;

        it("works for a 4-list", () =>
            expect(list([1, 2, 3, 4])).to.equal("1, 2, 3, and 4"));
        it("works for a 3-list", () =>
            expect(list([5, 6, 7])).to.equal("5, 6, and 7"));
        it("works for a 2-list", () =>
            expect(list([8, 9])).to.equal("8 and 9"));
        it("works for a 1-list", () =>
            expect(list([10])).to.equal("10"));

        // The empty list is intentionally not tested
        // because the behavior is roughly unspecified.

    });

});
