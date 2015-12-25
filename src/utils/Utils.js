export function gcd(a, b) {
    if (b === 0) {
        return Math.abs(a);
    } else {
        return gcd(b, a % b);
    }
}

/*
 * You'd like something like 'Array(length).map(callback)' to work,
 * but it doesn't because this is JavaScript
 * and "uninitialized array position" and "undefined value at position"
 * are different things, so 'map' and friends don't work on such arrays.
 * Instead, this does what you want.
 *
 * More precisely, 'length' is the length of an array to create,
 * and 'callback' is a callback that takes
 * an index into the array
 * and (optionally) the previous state of the array
 * and returns the element at the given index.
 *
 * For example: 'buildArray(5, x => x * x)' returns [0, 1, 4, 9, 16],
 * and 'buildArray(5, (i, r) => (r[i - 1] || 0) + i)' returns [0, 1, 3, 6, 10].
 */
export function buildArray(length, callback) {
    const result = Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = callback(i, result);
    }
    return result;
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
    });

    // Make sure the step size is non-zero.
    if (step === 0) {
        throw new Error("expected non-zero step size");
    }

    // Finally, create an populate an array.
    return buildArray(Math.max(0, Math.ceil((max - min) / step)), (i, r) =>
        i === 0 ? min : (r[i - 1] + step));
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
