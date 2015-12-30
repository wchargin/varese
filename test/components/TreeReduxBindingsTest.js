import {describe, it} from 'mocha';
import {expect} from 'chai';

import {createStore} from 'redux';

import {initialState} from '../TestData';

import reducer from '../../src/core/Reducers';
import CustomPropTypes from '../../src/components/CustomPropTypes';

import {
    mapStateToProps,
    mapDispatchToProps,
} from '../../src/components/TreeReduxBindings';

describe('TreeReduxBindings', () => {
    const create = () => createStore(reducer);

    it("#mapStateToProps returns an object given the initial state", () =>
        expect(mapStateToProps(initialState)).to.be.an('object'));

    it("#mapDispatchToProps returns an object given the initial store", () =>
        expect(mapDispatchToProps(create().dispatch)).to.be.an('object'));

    it("the 'onSetAcousticRatio' prop sets the acoustic ratio", () => {
        const {dispatch, getState} = create();
        const {onSetAcousticRatio} = mapDispatchToProps(dispatch);
        onSetAcousticRatio(5, initialState.acousticRatios[8]);
        expect(getState().acousticRatios[5])
            .to.deep.equal(initialState.acousticRatios[8]);
    });

    describe("view options handlers object", () => {
        it("validates against the 'viewOptionsHandlers' propType", () => {
            const {dispatch} = create();
            const handlers = mapDispatchToProps(dispatch).viewOptionsHandlers;
            expect(CustomPropTypes.viewOptionsHandlers.isRequired(
                { 'handlers': handlers },
                'handlers',
                'TestHarness')).to.equal(null);
        });
        const runSpec = ({ field, action, value }) =>
            it(`can set the '${field}' viewOptions field`, () => {
                const {dispatch, getState} = create();
                action(mapDispatchToProps(dispatch).viewOptionsHandlers);
                expect(getState().treeViewOptions)
                    .to.have.property(field, value);
            });
        const specs = [{
            field: 'levels',
            action: handlers => handlers.onSetLevels(7),
            value: 7,
        }, {
            field: 'infiniteLevels',
            action: handlers => handlers.onSetInfiniteLevels(3.14),
            value: 3.14,
        }, {
            field: 'infiniteHeight',
            action: handlers => handlers.onSetInfiniteHeight(234),
            value: 234,
        }, {
            field: 'showRoots',
            action: handlers => handlers.onSetShowRoots(false),
            value: false,
        }, {
            field: 'showOctaves',
            action: handlers => handlers.onSetShowOctaves(false),
            value: false,
        }, {
            field: 'wide',
            action: handlers => handlers.onSetWide(true),
            value: true,
        }, {
            field: 'treeNumber',
            action: handlers => handlers.onSetTreeNumber(7),
            value: 7,
        }, {
            field: 'rootBass',
            action: handlers => handlers.onSetRootBass(-22),
            value: -22,
        }, {
            field: 'highQuality',
            action: handlers => handlers.onSetHighQuality(true),
            value: true,
        }, {
            field: 'rainbowFactor',
            action: handlers => handlers.onSetRainbowFactor(0.11),
            value: 0.11,
        }, {
            field: 'alwaysEngrave',
            action: handlers => handlers.onSetAlwaysEngrave(true),
            value: true,
        }];
        specs.forEach(runSpec);
        it("can set a limit value", () => {
            const {dispatch, getState} = create();
            const handlers = mapDispatchToProps(dispatch).viewOptionsHandlers;
            handlers.onSetLimitValue('minIndividual', 10);
            expect(getState().treeViewOptions.limits.minIndividual)
                .to.equal(10);
        });
        it("can set a limit enabled flag", () => {
            const {dispatch, getState} = create();
            const handlers = mapDispatchToProps(dispatch).viewOptionsHandlers;
            handlers.onSetLimitEnabled('maxCombined', true);
            expect(getState().treeViewOptions.limits.maxCombinedEnabled)
                .to.equal(true);
        });
    });

});
