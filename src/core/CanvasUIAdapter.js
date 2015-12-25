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

// TODO(william) STOPSHIP: Implement these
/* eslint-disable no-unused-vars */
function handleWheel(getState, setState) {}
function handleMouseUp(getState, setState) {}
function handleKeyDown(getState, setState) {}
function handleKeyUp(getState, setState) {}
function handleBlur(getState, setState) {}
/* eslint-enable */
