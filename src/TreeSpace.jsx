import {outfoldUp, outfoldDown} from './Folding';

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

/*
 * Given
 *   - the root node of the tree (the 'n' in T(n)),
 *   - the row and column of a node within the tree,
 *   - and the pitch of the bass note in the node at (0, 0),
 * find the pitches in the chord at the given position.
 *
 * For example, the tree with root chord [5, 7, 9]
 * is T(2) with a bass of 5.
 * So to find the chord at position (11, 13) within that tree,
 * you could evaluate positionToPitches(2, 11, 13, 5).
 */
export function positionToPitches(root, row, col, bass) {
    const folds = positionToPath(row, col, outfoldDown, outfoldUp);
    const bassChord = [0, 1, 2].map(n => bass + n * root);
    return folds && folds.reduce((chord, op) => op(chord), bassChord);
}

export default {
    positionToPath,
    positionToPitches,
};
