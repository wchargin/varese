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

/*
 * We use a lightweight object to keep track of the canvas state over time.
 * This function generates the initial state.
 *
 * You must set the view options to a non-null value
 * before consuming the state.
 */
export function initialState() {
    return {
        canvasDimensions: {
            width: 800,
            height: 600,
        },
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
 * Set the canvas dimensions, and return the new state.
 */
export function setCanvasDimensions(state, canvasWidth, canvasHeight) {
    return {
        ...state,
        canvasDimensions: {
            width: canvasWidth,
            height: canvasHeight,
        },
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
    return {
        width: state.canvasDimensions.width,
        height: state.canvasDimensions.height /
            state.viewOptions.infiniteLevels,
    };
}

/*
 * We use some exponential factors 2^row when rendering,
 * and bizarre things start happening at really high rows.
 * This function returns the index of the highest row
 * that we think won't produce weird output.
 */
export function getMaxSafeRow() {
    // Weirdness seems to kick in as we approach Number.MAX_SAFE_INTEGER,
    // so we stop just a few before there,
    // where (empirically) the effects become observable.
    const bits = Math.floor(Math.log2(Number.MAX_SAFE_INTEGER));
    return bits - 2;
}

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
    const levelMax = getMaxSafeRow();
    const yPaddingBottom = 2;  // don't chop off the bottom few rows
    const yMax = levelMax - state.viewOptions.infiniteLevels + yPaddingBottom;
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
