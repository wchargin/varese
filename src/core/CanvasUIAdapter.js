import * as CanvasCore from './CanvasCore';

export function initialState() {
    return {
        lastMouse: null,
        mouseDown: false,
        keysDown: [],
        coreState: CanvasCore.initialState,
    };
}

export function createHandlers(getState, setState) {
    const link = fn => fn.bind(this, getState, setState);
    return {
        onMouseDown: link(handleMouseDown),
        onMouseMove: link(handleMouseMove),
        onWheel: link(handleWheel),
        onMouseUp: link(handleMouseUp),
        onKeyDown: link(handleKeyDown),
        onKeyUp: link(handleKeyUp),
        onBlur: link(handleBlur),
    };
}

// TODO(william) STOPSHIP: Implement these
/* eslint-disable no-unused-vars */
function handleMouseDown(getState, setState) {}
function handleMouseMove(getState, setState) {}
function handleWheel(getState, setState) {}
function handleMouseUp(getState, setState) {}
function handleKeyDown(getState, setState) {}
function handleKeyUp(getState, setState) {}
function handleBlur(getState, setState) {}
/* eslint-enable */
