import Rational from './Rational';
import {extendRationalizer} from './HarmonicSeries';

export const restrictedRationalizerDomain = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const canonicalValues = [
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
];
export const canonicalRationalizer = extendRationalizer(canonicalValues);

export const intervalNames = [
    "m2", "M2", "m3", "M3",
    "P4", "A4/d5", "P5",
    "m6", "M6", "m7", "M7"
];
