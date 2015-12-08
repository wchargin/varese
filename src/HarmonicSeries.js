import Rational from './Rational';

/*
 * Given mappings for the eleven non-unitary simple intervals
 * from equal temperament to just intonation---
 * that is, given the acoustic ratios
 * for all intervals from a minor second to a major seventh, inclusive---
 * create a function that will map any semitone difference (as an integer)
 * to the corresponding acoustic ratio
 * determined by extrapolating octave-wise from the provided ratios.
 *
 * The input must be a length-11 array of Rationals, where
 * the first element is the acoustic ratio for a minor second (1 semitone),
 * and the last is the acoustic ratio for a major seventh (11 semitones).
 * These should all be ratios between 1 and 1/2 (exclusive),
 * and the array should be in strictly decreasing order,
 * although these constraints are not verified.
 *
 * For example, a perfect fifth should be (2 / 3), not (3 / 2).
 *
 * The type of this function is ({1, ..., 11} -> Q) -> (Z -> Q),
 * or, equivalently and a bit more accurately, (Q^11) -> (Z -> Q),
 * where Z and Q are the sets of integers and Rationals, respectively.
 */
export function extendRationalizer(table) {
    if (!Array.isArray(table)) {
        throw new Error("expected input to be an array, but found:" + table);
    }
    if (table.length !== 11) {
        throw new Error(
            "expected input length to be exactly 11, " +
            "but found: " + table.length);
    }
    table.forEach((element, index) => {
        if (!(element instanceof Rational)) {
            throw new Error(
                `expected all elements to be Rationals, ` +
                `but the element at index ${index} is: ${element}`);
        }
    });

    const realTable = [new Rational(1, 1), ...table];

    return function rationalizer(n) {
        if (isNaN(n)) {
            throw new Error("expected input to be an number, but got: " + n);
        }
        if (!isFinite(n)) {
            throw new Error("expected input to be finite, but got: " + n);
        }
        if (n !== Math.round(n)) {
            throw new Error("expected input to be an integer, but got: " + n);
        }

        const octaves = Math.floor(n / 12);
        const fac = new Rational(1, 2).exponentiateScalar(octaves);

        const mod = n % 12;
        const idx = mod < 0 ? mod + 12 : mod;

        return realTable[idx].multiply(fac);
    };
}

/*
 * Convert a multiple of the fundamental frequency
 * to a equal-temperament semitone difference.
 * For example, 4 maps to 24,
 * because the fourth overtone is two octaves above the fundamental,
 * and two octaves comprise 24 semitones.
 * Similarly, 3 maps to about 19.01955,
 * because the third overtone is an octave and a perfect fifth above,
 * and this corresponds to about that many semitones.
 *
 * Note that the returned value need not be an integer.
 */
export function temperExact(fundamentalMultiple) {
    return 12 * Math.log2(fundamentalMultiple);
}

/*
 * Like 'temperExact', but rounds the result to the nearest integer.
 */
export function temper(fundamentalMultiple) {
    return Math.round(temperExact(fundamentalMultiple));
}

export const canonicalRationalizer = extendRationalizer([
    new Rational(15, 16),
    new Rational(8, 9),
    new Rational(5, 6),
    new Rational(4, 5),
    new Rational(3, 4),
    new Rational(12, 17),
    new Rational(2, 3),
    new Rational(5, 8),
    new Rational(3, 5),
    new Rational(5, 9),
    new Rational(8, 15),
]);

export default {
    extendRationalizer,
    temperExact,
    temper,

    canonicalRationalizer,
};
