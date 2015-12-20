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
