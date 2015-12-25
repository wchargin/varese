/*
 * The purpose of this file is to provide a functional abstraction
 * over the necessarily highly imperative implementation
 * of the canvas for the infinite tree explorer.
 *
 * This file handles the positioning logic,
 * the mathematics and logic of event handling,
 * and the logic of determining what needs to be drawn when,
 * so that all the canvas needs to do is actually draw it.
 * In a sense, the canvas implementation
 * becomes an interpreter for a DSL output by this file.
 *
 * The coordinate systems used in this file
 * are defined in the same way as in documentation for InfiniteCanvas.
 * (Eventually, those definitions may be moved here.)
 */
import {range} from '../utils/Utils';

/*
 * We use a lightweight object to keep track of the canvas state over time.
 * This function generates the initial state.
 *
 * You must set the view options to a non-null value
 * before consuming the state.
 */
export function initialState() {
    return {
        canvasWidth: 800,
        viewOptions: null,  // must be set before you try to do anything!
        //
        // The 'position' field locates the viewport,
        // which is anchored with top-center gravity
        // and described in idealized coordinates.
        position: {
            x: 0,
            y: 0,
        },
        lastMouse: null,  // canvas coordinates
        mouseDown: false,
        keysDown: [],     // a list of numeric key codes
    };
}

/*
 * Set the view options, and return the new state.
 */
export function setViewOptions(state, viewOptions) {
    return {
        ...state,
        viewOptions,
    };
}

/*
 * Set the canvas width, and return the new state.
 */
export function setCanvasWidth(state, canvasWidth) {
    return {
        ...state,
        canvasWidth,
    };
}

/*
 * Return the dimensions, in canvas coordinates, of
 * the portion of a row that would appear in the viewport.
 * The rows are evenly distributed across the viewport height.
 *
 * The return value has the shape { width: number, height: number },
 * using canvas coordinates.
 *
 * Requires 'viewOptions' to have been set.
 */
export function getRowDimensions(state) {
    const {viewOptions} = state;
    return {
        width: state.canvasWidth,
        height: viewOptions.infiniteHeight / viewOptions.infiniteLevels,
    };
}

/*
 * We use some exponential factors 2^row when rendering,
 * and bizarre things start happening at really high rows.
 * This function returns the index of the highest row
 * that we think won't produce weird output.
 */
export const maxSafeRow = (() => {
    // Weirdness seems to kick in as we approach Number.MAX_SAFE_INTEGER,
    // so we stop just a few before there,
    // where (empirically) the effects become observable.
    const bits = Math.floor(Math.log2(Number.MAX_SAFE_INTEGER));
    return bits - 2;
})();

/*
 * As we move down in the viewport, we change the horizontal scale.
 * You can interpret this in two ways:
 * either we compress the viewport by a certain factor
 * or we expand the nodes themselves by a certain factor.
 * This method returns that scaling factor.
 *
 * To be a bit more precise, the result of this method is the number 'c'
 * such that the viewport width, in absolute coordinates, is 1 / c.
 *
 * The argument should be the 'y' coordinate of the current position,
 * in absolute coordinates.
 * If you have a state object, see 'getScalingFactor'.
 */
export function getScalingFactorForHeight(y) {
    return Math.pow(2, y);
}

/*
 * Like 'getScalingFactorForHeight', but uses the state's 'y' position.
 */
export function getScalingFactor(state) {
    return getScalingFactorForHeight(state.position.y);
}

/*
 * Given a displacement in canvas coordinates,
 * compute the new stateful position in absolute coordinates.
 *
 * The displacement argument should have shape {x: number, y: number}.
 *
 * The return value is the new value for the 'position' field.
 */
export function getPanResult(state, canvasDeltaXY) {
    const {width: rowWidth, height: rowHeight} = getRowDimensions(state);

    const newY = state.position.y + canvasDeltaXY.y / rowHeight;
    const yMin = 0;
    const yPaddingBottom = 2;  // don't chop off the bottom few rows
    const yMax =
        maxSafeRow - state.viewOptions.infiniteLevels + yPaddingBottom;
    const finalY = Math.max(yMin, Math.min(newY, yMax));

    // The value of 'perceivedWidth' represents
    // the width of the entire row (not just what's inside the viewport)
    // in canvas coordinates.
    // This allows us to determine
    // the proportion of the absolute width
    // through which the user wants to scroll,
    // which is the delta in absolute coordinates
    // (which is what we want, because 'position' is in absolute coordinates).
    const scalingFactor = getScalingFactorForHeight(finalY);
    const perceivedWidth = rowWidth * scalingFactor;
    const newX = state.position.x + canvasDeltaXY.x / perceivedWidth;
    const rangeX = 1 - 1 / scalingFactor;
    const minX = -rangeX / 2;
    const maxX = +rangeX / 2;
    const finalX = Math.max(minX, Math.min(newX, maxX));

    return { x: finalX, y: finalY };
}

/*
 * Get the new position due to the provided pan (see 'getPanResult')
 * and apply it to the state, returning the new state.
 */
export function performPan(state, canvasDeltaXY) {
    return {
        ...state,
        position: getPanResult(state, canvasDeltaXY),
    };
}

/*
 * Determine which rows should be painted in the current viewport.
 * This includes all rows with any node completely within bounds,
 * and up to one row direct above those rows
 * so that nodes entering the current viewport can scroll into view smoothly.
 *
 * The return value is an array of consecutive integers,
 * representing the indices of the rows to paint;
 * the first row is row 0.
 */
export function getRowsInView(state) {
    const firstFullyVisibleRow = Math.ceil(state.position.y);
    const firstPartiallyVisibleRowUnclamped = firstFullyVisibleRow - 1;
    const firstRow = Math.max(0, firstPartiallyVisibleRowUnclamped);

    const lastRowUnclamped =
        Math.floor(state.position.y + state.viewOptions.infiniteLevels);
    const lastRow = Math.min(maxSafeRow, lastRowUnclamped);

    return range(firstRow, lastRow + 1);  // inclusive
}

/*
 * Determine which columns of a given row
 * should be painted in the current viewport.
 * This includes all columns whose nodes are completely within bounds,
 * and up to one column directly before and after those columns
 * so that nodes entering the current viewport can scroll into view smoothly.
 *
 * The return value is an array of consecutive integers,
 * representing the indices of the columns to paint;
 * the first column is column 0.
 */
export function getColumnsInView(state, row) {
    const scalingFactor = getScalingFactor(state);

    // Determine the left and right viewport bounds in [0, 1]-coordinates.
    const viewportXc = state.position.x + 0.5;
    const viewportWidth = 1 / scalingFactor;
    const viewportXl = viewportXc - viewportWidth / 2;
    const viewportXr = viewportXc + viewportWidth / 2;

    const nodesInRow = Math.pow(2, row);
    const nominalMin = Math.ceil(nodesInRow * viewportXl - 0.5);
    const nominalMax = Math.floor(nodesInRow * viewportXr - 0.5);

    const expandedMin = Math.max(0, nominalMin - 1);
    const expandedMax = Math.min(nodesInRow - 1, nominalMax + 1);

    return range(expandedMin, expandedMax + 1);  // inclusive
}

// The padding between the top of each row
// and the top of the nodes within that row.
export const rowPadding = 20;

/*
 * Get the canvas coordinates of the node in the given row and column.
 */
export function getNodeCanvasCoordinates(state, row, column) {
    const {width: rowWidth, height: rowHeight} = getRowDimensions(state);

    const idealY = row;
    const viewportRelativeY = idealY - state.position.y;
    const canvasY = viewportRelativeY * rowHeight + rowPadding;

    // We compute the 'x' position in terms of
    // the offset from the centerline (OFC).
    const nodesInRow = Math.pow(2, row);
    const idealX = (column + 0.5) / nodesInRow - 0.5;
    const viewportRelativeOFC = idealX - state.position.x;
    const scaledOFC = viewportRelativeOFC * getScalingFactor(state);
    const canvasOFC = scaledOFC * rowWidth;
    const canvasX = canvasOFC + rowWidth / 2;

    return { x: canvasX, y: canvasY };
}
