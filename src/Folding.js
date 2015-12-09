export function outfoldUp(arr) {
    const [low, mid, high] = arr;
    return [low, high, high + (high - mid)];
}

export function outfoldDown(arr) {
    const [low, mid, high] = arr;
    return [low - (mid - low), low, high];
}

export default {
    outfoldUp,
    outfoldDown,
};
