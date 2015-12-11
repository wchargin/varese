export function gcd(a, b) {
    if (b === 0) {
        return Math.abs(a);
    } else {
        return gcd(b, a % b);
    }
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

export default {
    gcd,
    arraysEqual,
};
