import {describe, it} from 'mocha';
import {expect} from 'chai';

import * as VexFlowUtils from '../../src/utils/VexFlowUtils';

describe('VexFlowUtils', () => {

    describe('#pitchesToStaveNote', () => {
        const {pitchesToStaveNote} = VexFlowUtils;

        // Vex.Flow.StaveNote#getAccidentals is broken.
        // We can work around that.
        // At the same time, we extract just the useful data.
        function getAccidentals(staveNote) {
            return staveNote.modifiers
                .filter(modifier => modifier.getCategory() === "accidentals")
                .map(modifier => ({
                index: modifier.index,
                type: modifier.type,
            }));
        }

        const makeCTriad = (duration = undefined) =>
            pitchesToStaveNote([0, 4, 7], duration);
        it("generates the correct notes for a middle C major triad", () =>
            expect(makeCTriad().getKeys()).to.deep.equal(
                ["c/4", "e/4", "g/4"]));
        it("adds no accidentals to a middle C major triad", () =>
            expect(getAccidentals(makeCTriad())).to.deep.equal([]));

        // Really we'd like this to be C/E/G#,
        // but it's going to come out as C/E/Ab.
        // That's fine; deal with it.
        const makeCAug = () => pitchesToStaveNote([0, 4, 8]);
        it("generates the correct notes for a middle C augmented triad", () =>
            expect(makeCAug().getKeys()).to.deep.equal(
                ["c/4", "e/4", "ab/4"]));
        it("adds the correct accidentals to a middle C augmented triad", () =>
            expect(getAccidentals(makeCAug())).to.deep.equal(
                [{ index: 2, type: "b" }]));

        const makeWide = () => pitchesToStaveNote([-12, 0, 16]);
        it("generates the correct pitches for an open compound M3", () =>
            expect(makeWide().getKeys()).to.deep.equal(
                ["c/3", "c/4", "e/5"]));
        it("adds no accidentals to this particular chord", () =>
            expect(getAccidentals(makeWide())).to.deep.equal([]));

        it("allows specifying a non-whole-note duration", () =>
            expect(makeCTriad('q').duration).to.equal('q'));
    });

});
