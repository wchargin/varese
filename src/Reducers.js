import Rational from './Rational';

import {canonicalValues} from './HarmonicData';
const initialState = {
    acousticRatios: canonicalValues,
    treeViewOptions: {
        levels: 4,
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
    },
};

function setAcousticRatio(state, index, ratio) {
    const {acousticRatios} = state;
    if (index < 0 || index >= acousticRatios.length) {
        throw new Error(
            `acoustic ratio is out of bounds: ` +
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

function rehydrate(newState) {
    const {acousticRatios} = newState;
    if (!Array.isArray(acousticRatios)) {
        throw new Error(
            `expected to find an array of acousticRatios, ` +
            `but found: ${acousticRatios}`);
    }
    const rehydratedRatios = acousticRatios.map(x => new Rational(x.a, x.b));
    return {
        ...newState,
        acousticRatios: rehydratedRatios,
    };
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case "NOOP":
            return state;
        case "SET_ACOUSTIC_RATIO":
            return setAcousticRatio(state, action.index, action.ratio);
        case "SET_TREE_LEVELS":
            return setTreeViewOption(state, 'levels', action.levels);
        case "SET_TREE_SHOW_ROOTS":
            return setTreeViewOption(state, 'showRoots', action.showRoots);
        case "SET_TREE_SHOW_OCTAVES":
            return setTreeViewOption(state, 'showOctaves', action.showOctaves);
        case "SET_TREE_WIDE":
            return setTreeViewOption(state, 'wide', action.wide);
        case "SET_TREE_LIMIT_VALUE":
            return setTreeLimitValue(state, action.limit, action.value);
        case "SET_TREE_LIMIT_ENABLED":
            return setTreeLimitEnabled(state, action.limit, action.enabled);
        case "REHYDRATE":
            return rehydrate(action.newState);
        default:
            return state;
    }
}
