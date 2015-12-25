import * as CanvasCore from './CanvasCore';

export function initialState(coreState) {
    return {
        lastMouse: null,
        mouseDown: false,
        keysDown: [],
        coreState,
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

function handleMouseDown(getState, setState) {
    setState({
        ...getState(),
        mouseDown: true,
    });
}

function getRelativeMousePosition(e) {
    const {left: baseX, top: baseY} = e.target.getBoundingClientRect();
    return {
        x: e.clientX - baseX,
        y: e.clientY - baseY,
    };
}

function handleMouseMove(getState, setState, e) {
    const state = getState();
    const oldMouse = state.lastMouse;
    const newMouse = getRelativeMousePosition(e);
    setState({
        ...state,
        lastMouse: newMouse,
        coreState: !state.mouseDown ?
            state.coreState :
            CanvasCore.performPan(state.coreState, {
                x: -(newMouse.x - oldMouse.x),
                y: -(newMouse.y - oldMouse.y),
            }),
    });
}

function handleWheel(getState, setState, e) {
    // If the user is just scrolling down the page
    // and their mouse happens to pass over the canvas,
    // we don't want to capture that scroll event.
    // Only scroll when we have focus.
    if (document.activeElement !== e.target) {
        return;
    }
    e.preventDefault();

    const state = getState();
    const newCoreState = CanvasCore.performPan(
        state.coreState, { x: e.deltaX, y: e.deltaY });
    setState({ ...state, coreState: newCoreState });
}

// TODO(william) STOPSHIP: Implement these
/* eslint-disable no-unused-vars */
function handleMouseUp(getState, setState) {}
function handleKeyDown(getState, setState) {}
function handleKeyUp(getState, setState) {}
function handleBlur(getState, setState) {}
/* eslint-enable */
