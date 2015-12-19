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

// TODO(william): put these in Folding and test them separately
function outfoldUp(semis) {
    return [semis[0] + semis[1], semis[1]];
}
function outfoldDown(semis) {
    return [semis[0], semis[0] + semis[1]];
}

export function positionToSemitones(root, row, col, leftIsDown = true) {
    const lop = leftIsDown ? outfoldDown : outfoldUp;
    const rop = leftIsDown ? outfoldUp : outfoldDown;
    const operations = positionToPath(row, col, lop, rop);
    const base = [root, root];
    return operations && operations.reduce((chord, op) => op(chord), base);
}

export default {
    positionToPath,
    positionToSemitones,
};
