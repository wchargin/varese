export function positionToPath(row, col, left = 0, right = 1) {
    if (0 > col || col >= Math.pow(2, row)) {
        return null;
    }
    const result = Array(row);
    let remaining = col;
    for (let index = row - 1; index >= 0; index--) {
        result[index] = remaining % 2 ? right : left;
        remaining = Math.floor(remaining / 2);
    }
    return result;
}

export default {
    positionToPath,
};
