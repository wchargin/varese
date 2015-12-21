import {pitchToName} from './PitchNames';
/*
 * Determine whether the given chord passes the given limit filters.
 * Return true if the chord should be displayed, or false otherwise.
 */
export function withinLimits(notes, limits) {
    if (!limits) {
        return true;
    }

    const span = notes[notes.length - 1] - notes[0];
    if (limits.minCombinedEnabled && span < limits.minCombined) {
        return false;
    }
    if (limits.maxCombinedEnabled && span > limits.maxCombined) {
        return false;
    }

    const deltas = notes.slice(1).map((snd, idx) => snd - notes[idx]);
    if (limits.minIndividualEnabled && deltas.some(x =>
            x < limits.minIndividual)) {
        return false;
    }
    if (limits.maxIndividualEnabled && deltas.some(x =>
            x > limits.maxIndividual)) {
        return false;
    }

    return true;
}

/*
 * Given a result of HarmonicSeries.findChordRootOffset,
 *
 *   - format the root pitch, respecting the given view options,
 *     when the result indicates success;
 *
 *   - return a single question mark "?"
 *     when the result is failure due to
 *     an infinite term or zero acoustic ratio; or
 *
 *   - throw an exception if the result indicates
 *     failure for some other (unexpected) reason.
 */
export function formatMaybeRoot(maybeRootPitch, viewOptions) {
    if (maybeRootPitch.status === "success") {
        const rootPitch = maybeRootPitch.result;
        return pitchToName(rootPitch, true, viewOptions.showOctaves);
    } else {
        const e = maybeRootPitch.error;
        if (e.match(/finite/) || e.match(/zero_ratio/)) {
            return "?";
        } else {
            throw e;
        }
    }
}
