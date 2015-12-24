export function gcd(a, b) {
    if (b === 0) {
        return Math.abs(a);
    } else {
        return gcd(b, a % b);
    }
}

/*
 * Takes either one, two, or three arguments:
 *     
 *   - range(b)       = [0, 1, ..., b - 1];
 *   - range(a, b)    = [a, a + 1, ..., b - 1]; or
 *   - range(a, b, s) = [a, a + s, ..., a + ks]
 *                      where 'k' is the largest integer such that a + ks < b.
 *
 * All arguments, when present, must be finite numbers,
 * but need not be integers (though beware of floating-point voodoo).
 * Descending ranges are fine.
 * The step size may not be zero.
 */
export function range(...args) {
    // Extract the arguments.
    let min, max, step;
    switch (args.length) {
        case 1:
            min = 0;
            max = args[0];
            step = 1;
            break;
        case 2:
            [min, max] = args;
            step = 1;
            break;
        case 3:
            [min, max, step] = args;
            break;
        default:
            throw new Error(
                `Invalid arity ${args.length}; must be 0, 1, or 2`);
    }

    // Make sure all arguments are finite numbers.
    const checks = { min, max, step };
    Object.keys(checks).forEach(key => {
        const value = checks[key];
        if (isNaN(value)) {
            throw new Error(
                `expected '${value}' to be numeric, but got: ${value}`);
        }
        if (!isFinite(value)) {
            throw new Error(
                `expected '${value}' to be finite, but got: ${value}`);
        }
    })

    // Make sure the step size is non-zero.
    if (step === 0) {
        throw new Error("expected non-zero step size");
    }

    // Finally, create an populate an array.
    const result = Array(Math.max(0, Math.ceil((max - min) / step)));
    let acc = min;
    for (let i = 0; i < result.length; i++) {
        result[i] = acc;
        acc += step;
    }
    return result;
}

export function arraysEqual(arr1, arr2, comparator = (a, b) => a === b) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (!comparator(arr1[i], arr2[i])) {
            return false;
        }
    }
    return true;
}

export function flatten(arrays) {
    return Array.prototype.concat.apply([], arrays);
}

export default {
    gcd,
    range,
    arraysEqual,
    flatten,
};
