import {describe, it} from 'mocha';
import {expect} from 'chai';

import reducer from '../src/Reducers';
import Rational from '../src/Rational';
import * as Actions from '../src/Actions';

describe('reducer', () => {

    const expectStateToHaveTheRightShape = state => {
        expect(state).to.be.ok;
        expect(state.acousticRatios).to.be.an.instanceof(Array);
        expect(state.treeViewOptions).to.be.an('object');
        expect(state.treeViewOptions.limits).to.be.an('object');
    };

    const verifyShapeAnd = (also, state) => {
        expectStateToHaveTheRightShape(state);
        also(state);
    };

    it("should provide a reasonable initial state", () => {
        const initialState = reducer(undefined, Actions.noop());
        expectStateToHaveTheRightShape(initialState);
    });

    describe(':SET_ACOUSTIC_RATIO', () => {
        const r6 = new Rational(5, 7);
        const r8 = new Rational(11, 13);

        const state1 = reducer(undefined, Actions.noop());
        const ratios1 = state1.acousticRatios;

        const state2 = reducer(state1, Actions.setAcousticRatio(6, r6));
        const ratios2 = state2.acousticRatios;
        it("sets an acoustic ratio, preserving the others", () => {
            expect(ratios2.length).to.equal(ratios1.length);
            expect(ratios2[0]).to.deep.equal(ratios1[0]);
            expect(ratios2[5]).to.deep.equal(ratios1[5]);
            expect(ratios2[6]).to.deep.equal(r6);
            expect(ratios2[7]).to.deep.equal(ratios1[7]);
        });

        const state3 = reducer(state2, Actions.setAcousticRatio(8, r8));
        const ratios3 = state3.acousticRatios;
        it("sets another acoustic ratio, preserving the first change", () => {
            expect(ratios3.length).to.equal(ratios1.length);
            expect(ratios3[0]).to.deep.equal(ratios1[0]);
            expect(ratios3[5]).to.deep.equal(ratios1[5]);
            expect(ratios3[6]).to.deep.equal(r6);
            expect(ratios3[7]).to.deep.equal(ratios1[7]);
            expect(ratios3[8]).to.deep.equal(r8);
            expect(ratios3[9]).to.deep.equal(ratios1[9]);
        });
    });

    it(":SET_TREE_LEVELS sets the tree levels", () => [5, 6].forEach(levels =>
        verifyShapeAnd(
            state => expect(state.treeViewOptions.levels).to.equal(levels),
            reducer(undefined, Actions.setTreeLevels(levels)))));

    it(":SET_TREE_SHOW_ROOTS sets the 'showRoots' flag", () =>
        [true, false].forEach(flag =>
            verifyShapeAnd(
                state => expect(state.treeViewOptions.showRoots).to.be[flag],
                reducer(undefined, Actions.setTreeShowRoots(flag)))));

    it(":SET_TREE_SHOW_OCTAVES sets the 'showOctaves' flag", () =>
        [true, false].forEach(flag =>
            verifyShapeAnd(
                state => expect(state.treeViewOptions.showOctaves).to.be[flag],
                reducer(undefined, Actions.setTreeShowOctaves(flag)))));

    it(":SET_TREE_WIDE sets the 'wide' flag", () =>
        [true, false].forEach(flag =>
            verifyShapeAnd(
                state => expect(state.treeViewOptions.wide).to.be[flag],
                reducer(undefined, Actions.setTreeWide(flag)))));

    describe(':SET_TREE_LIMIT_VALUE', () => {
        it("sets a valid limit value", () => {
            [10, 20].forEach(value =>
                verifyShapeAnd(
                    state => expect(state.treeViewOptions.limits.minCombined)
                        .to.equal(value),
                    reducer(undefined, Actions.setTreeLimitValue(
                        "minCombined", value))));
        });
        it("complains on an invalid limit value", () =>
            expect(() => reducer(undefined, Actions.setTreeLimitValue(
                "nope", 10))).to.throw(/unknown limit/));
    });

    describe(':SET_TREE_LIMIT_ENABLED', () => {
        it("sets a valid limit-enabled flag", () => {
            [true, false].forEach(flag =>
                verifyShapeAnd(
                    state => expect(state
                        .treeViewOptions
                        .limits
                        .maxIndividualEnabled).to.equal(flag),
                    reducer(undefined, Actions.setTreeLimitEnabled(
                        "maxIndividual", flag))));
        });
        it("complains on an invalid limit value", () =>
            expect(() => reducer(undefined, Actions.setTreeLimitEnabled(
                "nope", 10))).to.throw(/unknown limit/));
        it("complains on a limit value that includes 'Enabled'", () =>
            expect(() => reducer(undefined, Actions.setTreeLimitEnabled(
                "maxIndividualEnabled", 10))).to.throw(/unknown limit/));
    });

});
