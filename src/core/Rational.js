import {gcd} from '../utils/Utils';

export default class Rational {

    constructor(a, b) {
        if (b === 0) {
            throw new Error("denominator must not be zero");
        }
        if (!isFinite(a)) {
            throw new Error("numerator must be finite");
        }
        if (!isFinite(b)) {
            throw new Error("denominator must be finite");
        }
        if (!isFinite(a / b)) {
            // can arise when dividing by subnormals, etc.
            throw new Error("rational must represent a finite quotient");
        }

        const divisor = gcd(a, b);
        const maybeNegate = b < 0 ? -1 : 1;
        const fac = maybeNegate / divisor;

        this.a = a * fac;
        this.b = b * fac;
    }

    equals(other) {
        return this.a === other.a && this.b === other.b;
    }

    multiply(other) {
        return new Rational(this.a * other.a, this.b * other.b);
    }

    exponentiateScalar(k) {
        if (k === 0) {
            return new Rational(1, 1);
        } else {
            const {a, b} = this;
            const absK = Math.abs(k);
            return new Rational(
                Math.pow(k > 0 ? a : b, absK),
                Math.pow(k > 0 ? b : a, absK));
        }
    }

    toNumber() {
        return this.a / this.b;
    }

}
