export function gcd(a, b) {
    if (b === 0) {
        return Math.abs(a);
    } else {
        return gcd(b, a % b);
    }
}

class Rational {

    constructor(a, b) {
        if (b === 0) {
            throw new Error("denominator is zero");
        }
        const divisor = Math.abs(gcd(a, b));
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

    toNumber() {
        return this.a / this.b;
    }

}

export default {
    gcd,
    Rational,
};
