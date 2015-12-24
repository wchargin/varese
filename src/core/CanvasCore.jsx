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
