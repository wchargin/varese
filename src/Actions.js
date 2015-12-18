export function noop() {
    return {
        type: "NOOP",
    };
}

export function setAcousticRatio(index, ratio) {
    return {
        type: "SET_ACOUSTIC_RATIO",
        index,
        ratio,
    };
}

export function setTreeLevels(levels) {
    return {
        type: "SET_TREE_LEVELS",
        levels,
    };
}

export function setInfiniteTreeLevels(levels) {
    return {
        type: "SET_INFINITE_TREE_LEVELS",
        levels,
    };
}

export function setTreeShowRoots(showRoots) {
    return {
        type: "SET_TREE_SHOW_ROOTS",
        showRoots,
    };
}

export function setTreeShowOctaves(showOctaves) {
    return {
        type: "SET_TREE_SHOW_OCTAVES",
        showOctaves,
    };
}

export function setTreeWide(wide) {
    return {
        type: "SET_TREE_WIDE",
        wide,
    };
}

export function setTreeLimitValue(limit, value) {
    return {
        type: "SET_TREE_LIMIT_VALUE",
        limit,
        value,
    };
}

export function setTreeLimitEnabled(limit, enabled) {
    return {
        type: "SET_TREE_LIMIT_ENABLED",
        limit,
        enabled,
    };
}

export function rehydrate(newState) {
    return {
        type: "REHYDRATE",
        newState,
    };
}
