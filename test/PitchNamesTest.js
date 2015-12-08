import {describe, it} from 'mocha';
import {expect} from 'chai';

import PitchNames from '../src/PitchNames';

describe('PitchNames', () => {

    describe('#pitchToName', () => {
        const {pitchToName: p2n} = PitchNames;
        const test = (input, output) => () =>
            expect(p2n(input)).to.equal(output);

        it("uses a C4 origin", test(0, "C4"));
        it("renders G4", test(7, "G4"));
        it("renders A4", test(9, "A4"));
        it("renders B4", test(11, "B4"));
        it("renders C5", test(12, "C5"));

        it("renders C#5", test(13, "C#5"));
        it("renders C3", test(-12, "C3"));
        it("renders Ab2", test(-16, "Ab2"));

        it("renders a pretty sharp for C\u266F4",
            () => expect(p2n(1, true)).to.equal("C\u266F4"));
        it("renders a pretty flat for A\u266D3",
            () => expect(p2n(-4, true)).to.equal("A\u266D3"));
    });

    describe('#nameToPitch', () => {
        const {nameToPitch: n2p} = PitchNames;
        const test = (input, output) => () =>
            expect(n2p(input)).to.equal(output);

        it("parses C4", test("C4", 0));
        it("parses C5", test("C5", 12));
        it("parses C#4", test("C#4", 1));
        it("parses a pretty C#4", test("C\u266F4", 1));

        const csss4 = "C\u266F#\u266F4";
        it("parses mixed plain/pretty " + csss4, test(csss4, 3));

        const dbbb4 = "Db\u266Db4";
        it("parses a mixed plain/pretty " + dbbb4, test(dbbb4, -1));

        it("parses B#5 as a C6, not a C5", test("B#5", 24));

        it("fails on mixed accidentals (flats first)", test("Cb#4", null));
        it("fails on mixed accidentals (sharps first)", test("C#b4", null));

        it("fails on BB4 (flat should be lowercase)", test("BB4", null));
        it("allows a b4 (lowercase note is okay)", test("b4", 11));
        it("allows a bb4 (B-flat 4)", test("bb4", 10));

        it("allows a really negative note", test("C-88", -92 * 12));
        it("allows a really positive note", test("C88",   84 * 12));
    });

})
