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
