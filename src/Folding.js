export function outfoldUp(arr) {
    const [low, mid, high] = arr;
    return [low, high, high + (high - mid)];
}

export function outfoldDown(arr) {
    const [low, mid, high] = arr;
    return [low - (mid - low), low, high];
}

export function infoldCanonical(arr) {
    const [low, mid, high] = arr;
    const [deltaLow, deltaHigh] = [mid - low, high - mid];

    if (deltaLow < deltaHigh) {
        // Infold up.
        return [mid, mid + deltaLow, high];
    } else if (deltaHigh < deltaLow) {
        // Infold down.
        return [low, mid - deltaHigh, mid];
    } else {
        // This is the root of the tree; there is no infolding.
        return arr;
    }
}

export function invert(arr) {
    const [low, mid, high] = arr;
    return [low, low + (high - mid), high];
}

export default {
    outfoldUp,
    outfoldDown,
    infoldCanonical,
    invert,
};
