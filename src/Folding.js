/*
 * Folding operations for trichords.
 *
 * "Folding" a chord is like treating one of the pitches as a pivot point
 * and rotating another one of the pitches around it.
 * For example, if you have a trichord whose bottom interval has 5 semitones
 * and whose top interval has 3 semitones,
 * then you could perform an "upward outfolding"
 * by rotating the middle pitch about the top pitch;
 * the resulting pitch would have a bottom interval of 8 semitones
 * and a top interval of 3 semitones:
 *
 *     o----o==o
 *             |
 *     o-------o==o
 *
 * You could also outfold this same chord downward:
 *
 *          o====o--o
 *          |
 *     o====o-------o
 *
 * Note that, in an outfolding, only the middle pitch changes.
 *
 * The inverse operation of an outfolding is an infolding.
 * Again, you *could* fold in either the top or the bottom pitch,
 * but it only really makes sense to fold in
 * whichever pitch forms a smaller interval with the middle pitch:
 * otherwise, you'll change the middle pitch,
 * so you won't be able to perform an outfolding to get back to the original.
 *
 * For example, to infold a chord whose bottom interval has 5 semitones
 * and whose top interval has 3 semitones,
 * we'd need to rotate the top-most pitch about the middle pitch:
 *
 *     o----o==o
 *          |
 *     o-o==o
 *
 * Note that if we were to perform an upward outfolding of the result
 * we'd get back to where we started.
 *
 * Finally, the operation of inverting a chord
 * just switches the two intervals:
 *
 *     o----o--o
 *     o--o----o
 *
 * A chord whose intervals are the same can't be inverted
 * (or, its inversion is itself).
 */

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
