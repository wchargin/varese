import Rational from './Rational';

import merge from 'merge';

import {canonicalValues} from './HarmonicData';
const initialState = {
    acousticRatios: canonicalValues,
    treeViewOptions: {
        // There are two different 'levels' properties:
        // one for the finite tree, and one for the infinite tree.
        // All the other properties are shared, unless otherwise noted.
        levels: 4,              // for the finite tree; must be discrete
        infiniteLevels: 3,      // for the infinite tree; can be real
        infiniteHeight: 600,    // pixel height of the infinite tree
        //
        showRoots: true,
        showOctaves: true,
        wide: false,
        limits: {
            // TODO(william): refactor this to be more structured:
            // e.g., { combined: { min: { value: 4, enabled: false } } }
            minCombined: 4,
            maxCombined: 24,
            minIndividual: 2,
            maxIndividual: 12,
            minCombinedEnabled: false,
            maxCombinedEnabled: false,
            minIndividualEnabled: false,
            maxIndividualEnabled: false,
        },
        //
        // These fields are for the infinite tree only.
        treeNumber: 1,          // the 'n' in "the root has semitones '[n][n]'"
        rootBass: 0,            // semitones above middle C of the bass note
        highQuality: false,     // smoother, slower rendering
        rainbowFactor: 0,       // how colorful should the nodes be?
        alwaysEngrave: false,   // sohw engravings always, not just on hover
    },
};

function setAcousticRatio(state, index, ratio) {
    const {acousticRatios} = state;
    if (index < 0 || index >= acousticRatios.length) {
        throw new Error(
            `acoustic ratio index is out of bounds: ` +
            `got ${index}, but array length is ${acousticRatios.length}`);
    }
    if (!(ratio instanceof Rational)) {
        throw new Error(`expected Rational, but got: ${ratio}`);
    }
    return {
        ...state,
        acousticRatios: [
            ...acousticRatios.slice(0, index),
            ratio,
            ...acousticRatios.slice(index + 1),
        ],
    };
}

function setTreeViewOption(state, name, value) {
    return {
        ...state,
        treeViewOptions: {
            ...state.treeViewOptions,
            [name]: value,
        },
    };
}

function setTreeLimitField(state, name, value) {
    if (Object.keys(state.treeViewOptions.limits).indexOf(name) === -1) {
        throw new Error(`unknown limit field: ${name}`);
    }
    return {
        ...state,
        treeViewOptions: {
            ...state.treeViewOptions,
            limits: {
                ...state.treeViewOptions.limits,
                [name]: value,
            },
        },
    };
}

function setTreeLimitValue(state, name, value) {
    return setTreeLimitField(state, name, value);
}

function setTreeLimitEnabled(state, name, value) {
    return setTreeLimitField(state, `${name}Enabled`, value);
}

function rehydrate(state, dehydrated) {
    const merged = merge.recursive(true /* clone */, state, dehydrated);

    const {acousticRatios} = merged;
    if (!Array.isArray(acousticRatios)) {
        throw new Error(
            `expected to find an array of acousticRatios, ` +
            `but found: ${acousticRatios}`);
    }
    const rehydratedRatios = acousticRatios.map(x => new Rational(x.a, x.b));

    return {
        ...merged,
        acousticRatios: rehydratedRatios,
    };
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case "NOOP":
            return state;
        case "SET_ACOUSTIC_RATIO":
            return setAcousticRatio(state, action.index, action.ratio);
        case "SET_TREE_VIEW_OPTION":
            return setTreeViewOption(state, action.field, action.value);
        case "SET_TREE_LIMIT_VALUE":
            return setTreeLimitValue(state, action.limit, action.value);
        case "SET_TREE_LIMIT_ENABLED":
            return setTreeLimitEnabled(state, action.limit, action.enabled);
        case "REHYDRATE":
            return rehydrate(state, action.newState);
        default:
            return state;
    }
}
