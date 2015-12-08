export function gcd(a, b) {
    if (b === 0) {
        return Math.abs(a);
    } else {
        return gcd(b, a % b);
    }
}

export default {
    gcd,
};
