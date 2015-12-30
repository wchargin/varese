import {describe, it} from 'mocha';
import {expect} from 'chai';

import merge from 'merge';

import reducer from '../../src/core/Reducers';
import Rational from '../../src/core/Rational';
import * as Actions from '../../src/core/Actions';

describe('reducer', () => {

    const expectStateToHaveTheRightShape = state => {
        expect(state).to.be.an('object');
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

        it("throws when the ratio index is negative", () =>
            expect(() => reducer(state3, Actions.setAcousticRatio(-1, r6)))
                .to.throw(/index/));

        it("throws when the ratio index is 11 or higher", () =>
            expect(() => reducer(state3, Actions.setAcousticRatio(11, r6)))
                .to.throw(/index/));

        it("throws when the provided ratio is not a Rational", () =>
            expect(() => reducer(state3, Actions.setAcousticRatio(3, 0.5)))
                .to.throw(/Rational/));
    });

    it(":SET_INFINITE_TREE_LEVELS sets the infinite tree levels",
        () => [4, 5].forEach(levels =>
            verifyShapeAnd(
                state => expect(state.treeViewOptions.infiniteLevels)
                    .to.equal(levels),
                reducer(undefined, Actions.setInfiniteTreeLevels(levels)))));

    it(":SET_INFINITE_TREE_HEIGHT sets the infinite tree height",
        () => [600, 650, 700].forEach(height =>
            verifyShapeAnd(
                state => expect(state.treeViewOptions.infiniteHeight)
                    .to.equal(height),
                reducer(undefined, Actions.setInfiniteTreeHeight(height)))));

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

    it(":SET_TREE_TREE_NUMBER sets the 'treeNumber' field", () =>
        [1, 2, 3].forEach(value =>
            verifyShapeAnd(
                state => expect(state.treeViewOptions.treeNumber)
                    .to.equal(value),
                reducer(undefined, Actions.setTreeTreeNumber(value)))));

    it(":SET_TREE_ROOT_BASS sets the 'rootBass' field", () =>
        [-10, 0, 33].forEach(value =>
            verifyShapeAnd(
                state => expect(state.treeViewOptions.rootBass).to.equal(value),
                reducer(undefined, Actions.setTreeRootBass(value)))));

    it(":SET_TREE_HIGH_QUALITY sets the 'highQuality' field", () =>
        [true, false].forEach(flag =>
            verifyShapeAnd(
                state => expect(state.treeViewOptions.highQuality)
                    .to.equal(flag),
                reducer(undefined, Actions.setTreeHighQuality(flag)))));

    it(":SET_TREE_RAINBOW_FACTOR sets the 'rainbowFactor' field", () =>
        [0.0, 0.5, 1.0].forEach(value =>
            verifyShapeAnd(
                state => expect(state.treeViewOptions.rainbowFactor)
                    .to.equal(value),
                reducer(undefined, Actions.setTreeRainbowFactor(value)))));

    it(":SET_TREE_ALWAYS_ENGRAVE sets the 'alwaysEngrave' field", () =>
        [true, false].forEach(flag =>
            verifyShapeAnd(
                state => expect(state.treeViewOptions.alwaysEngrave)
                    .to.equal(flag),
                reducer(undefined, Actions.setTreeAlwaysEngrave(flag)))));

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

    describe(':REHYDRATE', () => {
        it("rehydrates the state, deserializing the Rationals", () => {
            const initialState = reducer(undefined, Actions.noop());

            // The important part of this sample data
            // is that the Rational objects will have been JSON-serialized.
            // The rehydration action must deserialize them.
            const originalData = {
                ...initialState,
                acousticRatios: [
                    new Rational(10, 7),
                    new Rational(9, 5),
                    new Rational(3, 2),
                    new Rational(41, 487),
                ],
                treeViewOptions: {
                    ...initialState.treeViewOptions,
                    levels: 999,
                    wide: true,
                    limits: {
                        ...initialState.treeViewOptions.limits,
                        minCombined: 121,
                    },
                },
            };
            const cycledData = JSON.parse(JSON.stringify(originalData));
            const newState = reducer(undefined, Actions.rehydrate(cycledData));

            expect(newState).to.deep.equal(originalData);

            // And, just to be very sure...
            newState.acousticRatios.forEach(obj =>
                expect(obj).to.be.an.instanceof(Rational));
        });
        it("complains when there are no acousticRatios", () => {
            const badState = {
                acousticRatios: "whoops",
                treeViewOptions: {
                    levels: 999,
                    wide: true,
                    limits: {
                        minCombined: 121,
                    },
                },
            };
            expect(() => reducer(undefined, Actions.rehydrate(badState)))
                .to.throw(/acousticRatios/);
        });

        it("upgrades your state to be forward-compatible", () => {
            // Fake an initial state with some extra stuff.
            const state0 = merge.recursive(true,  // clone
                reducer(undefined, Actions.noop()));
            state0.somePropToRemove = "original";

            // This test assumes the following properties all exist,
            // otherwise it's useless;
            // if this fails because the schema changed,
            // just pick some other dummy properties.
            expect(state0.treeViewOptions)
                .to.contain.all.keys('levels', 'limits');
            expect(state0.treeViewOptions.limits)
                .to.contain.all.keys('minCombined', 'maxCombined');

            // Fake a rehydrated state from an "old version"
            // with some fields missing;
            // they should be added back in when we rehydrate.
            const state1 = merge.recursive(true, state0);
            delete state1.somePropToRemove;
            delete state1.treeViewOptions.limits.minCombined;
            state1.treeViewOptions.limits.maxCombined = 77;
            state1.treeViewOptions.levels = 1;
            state1.anotherBrandNewThing = "wahoo";

            // Now try to rehydrate that state.
            const state2 = reducer(state0, Actions.rehydrate(state1));

            // Make sure the changed things stayed.
            expect(state2.treeViewOptions.levels).to.equal(1);
            expect(state2.treeViewOptions.limits.maxCombined).to.equal(77);
            expect(state2.anotherBrandNewThing).to.equal("wahoo");

            // Make sure the new top-level thing was added.
            expect(state2.somePropToRemove).to.equal(state0.somePropToRemove);

            // Make sure the "new" (i.e., undeleted) sub-level thing was added.
            expect(state2.treeViewOptions.limits.minCombined).to.equal(
                state0.treeViewOptions.limits.minCombined);
        });

    });

});
