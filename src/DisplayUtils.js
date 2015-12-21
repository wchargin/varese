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

/*
 * Given an ascending sequence of pitches
 * (as numbers, representing semitones above middle C),
 * format each of the pitches and also the differences between them
 * according to the given view options.
 *
 * If the sequence is not ascending,
 * some of the semitone differences will be negative;
 * the proper MINUS SIGN (U+2212) will be used in the representation.
 *
 * The return value has shape { noteNames: [string], semitoneNames: [string] },
 * where the values are in the same order as the input.
 *
 * For example, [0, 4, 7] might map to {
 *     noteNames: ["C4", "E4", "G4"],
 *     semitoneNames: ["[4]", "[3]"],
 * }, but the octaves are hidden if so specified by the view options.
 */
export function formatPitchesAndSemitones(notes, viewOptions) {
    const noteNames = notes.map(x =>
        pitchToName(x, true, viewOptions.showOctaves));
    const semitoneNames = notes.slice(1).map((snd, idx) =>
        `[${snd - notes[idx]}]`.replace(/-/, "\u2212"));
    return { noteNames, semitoneNames };
}
