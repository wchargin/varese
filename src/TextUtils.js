export function numberish(numberOrArray) {
    if (typeof numberOrArray === "number") {
        return numberOrArray;
    } else if (Array.isArray(numberOrArray)) {
        return numberOrArray.length;
    } else {
        throw new Error(`not very number-like: ${numberOrArray}`);
    }
}

export function ngettext(numberOrArray, singular, plural, other = {}) {
    const number = numberish(numberOrArray);
    if (number in other) {
        return other[number].toString();
    } else if (number === 1) {
        return singular.toString();
    } else {
        return plural.toString();
    }
}

export function quantity(numberOrArray, ...argsToNgettext) {
    const number = numberish(numberOrArray);
    return `${number} ${ngettext(numberOrArray, ...argsToNgettext)}`;
}

export function list(entries) {
    switch (entries.length) {
        case 0:
            // you probably shouldn't do that
            return "";
        case 1:
            return entries[0].toString();
        case 2:
            return `${entries[0]} and ${entries[1]}`;
        default:
            const init = entries.slice(0, entries.length - 1);
            const last = entries[entries.length - 1];
            return `${init.join(", ")}, and ${last}`;
    }
}

export default {
    ngettext,
    list,
    quantity,

    numberish,
};
