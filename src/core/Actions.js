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
        type: "SET_TREE_VIEW_OPTION",
        field: "levels",
        value: levels,
    };
}

export function setInfiniteTreeLevels(levels) {
    return {
        type: "SET_TREE_VIEW_OPTION",
        field: "infiniteLevels",
        value: levels,
    };
}

export function setInfiniteTreeHeight(height) {
    return {
        type: "SET_TREE_VIEW_OPTION",
        field: "infiniteHeight",
        value: height,
    };
}

export function setTreeShowRoots(showRoots) {
    return {
        type: "SET_TREE_VIEW_OPTION",
        field: "showRoots",
        value: showRoots,
    };
}

export function setTreeShowOctaves(showOctaves) {
    return {
        type: "SET_TREE_VIEW_OPTION",
        field: "showOctaves",
        value: showOctaves,
    };
}

export function setTreeWide(wide) {
    return {
        type: "SET_TREE_VIEW_OPTION",
        field: "wide",
        value: wide,
    };
}

export function setTreeTreeNumber(treeNumber) {
    return {
        type: "SET_TREE_VIEW_OPTION",
        field: "treeNumber",
        value: treeNumber,
    };
}

export function setTreeRootBass(rootBass) {
    return {
        type: "SET_TREE_VIEW_OPTION",
        field: "rootBass",
        value: rootBass,
    };
}

export function setTreeHighQuality(highQuality) {
    return {
        type: "SET_TREE_VIEW_OPTION",
        field: "highQuality",
        value: highQuality,
    };
}

export function setTreeRainbowFactor(rainbowFactor) {
    return {
        type: "SET_TREE_VIEW_OPTION",
        field: "rainbowFactor",
        value: rainbowFactor,
    };
}

export function setTreeAlwaysEngrave(alwaysEngrave) {
    return {
        type: "SET_TREE_VIEW_OPTION",
        field: "alwaysEngrave",
        value: alwaysEngrave,
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
