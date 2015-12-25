import * as CanvasCore from './CanvasCore';


///////////////////////////////////////////////////////////////////////////////
// Middleware creators
///////////////////////////////////////////////////////////////////////////////

export function initialState(coreState = CanvasCore.initialState()) {
    return {
        lastMouse: null,
        mouseDown: false,
        keysDown: [],
        coreState,
        //
        resizeListenerFunction: null,
        keyIntervalId: null,
    };
}

export function getCoreAccessor(getState) {
    return () => getState().coreState;
}

export function getMouseAccessor(getState) {
    return () => getState().lastMouse;
}

export function createHandlers(getState, setState) {
    const link = fn => fn.bind(this, getState, setState);
    return {
        onMouseDown: link(handleMouseDown),
        onMouseMove: link(handleMouseMove),
        onWheel: link(handleWheel),
        onMouseUp: link(handleMouseUp),
        onMouseLeave: link(handleMouseLeave),
        onKeyDown: link(handleKeyDown),
        onKeyUp: link(handleKeyUp),
        onBlur: link(handleBlur),
    };
}

export function createLifecycleMixins(getState, setState, getCanvas) {
    const link = fn => function linkedLifecycleMixin(...args) {
        // note: not bound to lexical 'this' (which is probably undefined here)
        return fn.apply(this, [getState, setState, getCanvas, ...args]);
    };
    return {
        componentWillMount: link(componentWillMount),
        componentDidMount: link(componentDidMount),
        componentWillReceiveProps: link(componentWillReceiveProps),
        componentDidUpdate: link(componentDidUpdate),
        componentWillUnmount: link(componentWillUnmount),
    };
}

export function mixInLifecycles(target, mixins) {
    Object.keys(mixins).forEach(name => {
        const mixedInFunction = mixins[name];
        const existing = target[name];
        if (typeof existing === 'function') {
            target[name] = function mixedInLifecycleMethod(...args) {
                mixedInFunction.apply(this, args);
                return existing.apply(this, args);
            };
        } else {
             target[name] = mixedInFunction;
        }
    });
}


///////////////////////////////////////////////////////////////////////////////
// Event handlers
///////////////////////////////////////////////////////////////////////////////

function handleMouseDown(getState, setState) {
    setState({
        ...getState(),
        mouseDown: true,
    });
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

function handleMouseUp(getState, setState) {
    setState({
        ...getState(),
        mouseDown: false,
    });
}

function handleMouseLeave(getState, setState) {
    setState({
        ...getState(),
        mouseDown: false,
    });
}

function handleKeyDown(getState, setState, e) {
    const state = getState();
    if (e.repeat) {
        return;
    }
    if (getMotionDirection(e.which) === null) {
        return;
    }
    if (state.keysDown.indexOf(e.which) !== -1) {
        // This can happen if you press the key,
        // then click and maybe drag a bit while still holding the key,
        // then release the mouse while holding the key.
        return;
    }
    setState({
        ...state,
        keysDown: [...state.keysDown, e.which],
    });
}

function handleKeyUp(getState, setState, e) {
    const state = getState();
    const keysDown = state.keysDown.filter(x => x !== e.which);
    setState({ ...state, keysDown });
}

function handleBlur(getState, setState) {
    setState({
        ...getState(),
        keysDown: [],
    });
}


///////////////////////////////////////////////////////////////////////////////
// Lifecycle mixins
///////////////////////////////////////////////////////////////////////////////

function componentWillMount(getState, setState) {
    const state = getState();
    const coreState = CanvasCore.setViewOptions(
        state.coreState,
        this.props.viewOptions);
    setState({ ...state, coreState });
}

function componentDidMount(getState, setState, getCanvas) {
    const resizeListenerFunction = () =>
        setState(resizeCanvas(getCanvas(), getState()));
    window.addEventListener('resize', resizeListenerFunction);

    const keyIntervalId = window.setInterval(
        () => processKeyTick(getState, setState, getCanvas),
        1000 / 60);

    setState({
        ...resizeCanvas(getCanvas(), getState()),
        resizeListenerFunction,
        keyIntervalId,
    });
}

function componentWillReceiveProps(getState, setState, getCanvas, newProps) {
    if (newProps.viewOptions !== this.props.viewOptions) {
        const state = getState();
        const coreState = CanvasCore.setViewOptions(
            state.coreState,
            newProps.viewOptions);
        setState({ ...state, coreState });
    }
}

function componentDidUpdate(getState, setState, getCanvas) {
    const state = getState();
    const newState = resizeCanvas(getCanvas(), state);
    if (newState !== state) {
        setState(newState);
    }
}

function componentWillUnmount(getState) {
    const state = getState();
    window.removeEventListener('resize', state.resizeListenerFunction);
    window.clearInterval(state.keyIntervalId);
}


///////////////////////////////////////////////////////////////////////////////
// Helper functions
///////////////////////////////////////////////////////////////////////////////

/*
 * Given a MouseEvent (or SyntheticMouseEvent) object,
 * determine the coordinates of the mouse pointer
 * with respect to the top-left corner of its target.
 */
function getRelativeMousePosition(e) {
    const {left: baseX, top: baseY} = e.target.getBoundingClientRect();
    return {
        x: e.clientX - baseX,
        y: e.clientY - baseY,
    };
}

/*
 * Given a numeric key code,
 * determine whether the associated key represents a movement action.
 *
 * If it does, return an object with shape { x: number, y: number },
 * where each number is either -1, 0, or +1
 * and indicates the presence and direction of movement along an axis.
 *
 * If it doesn't, return null.
 */
function getMotionDirection(which) {
    switch (which) {
        case 0x41:  // A
        case 0x25:  // Left
            return { x: -1, y: 0 };
        case 0x57:  // W
        case 0x26:  // Up
            return { x: 0, y: -1 };
        case 0x44:  // D
        case 0x27:  // Right
            return { x: +1, y: 0 };
        case 0x53:  // S
        case 0x28:  // Down
            return { x: 0, y: +1 };
        default:
            return null;
    }
}

/*
 * Note: this is a confusingly semi-pure function.
 * It's impure in that it modifies the <canvas> width in the DOM,
 * but it's pure in that it doesn't call 'setState';
 * this is needed to deal with React's batched events.
 * Instead, it will return the new state (in addition to mutating the DOM).
 */
function resizeCanvas(canvas, state) {
    const widthString = window.getComputedStyle(canvas).width;
    const width = parseInt(widthString.match(/(\d+)px/)[1], 10);
    if (width !== canvas.width) {
        canvas.width = width;
        const coreState = CanvasCore.setCanvasWidth(state.coreState, width);
        return { ...state, coreState };
    } else {
        return state;
    }
}

function processKeyTick(getState, setState, getCanvas) {
    const state = getState();
    if (state.mouseDown) {
        return;
    }
    const keys = state.keysDown;
    if (keys.length === 0) {
        // Not strictly necessary because of the 'clampedDelta' check below,
        // but maybe a bit helpful in avoiding a few CPU cycles.
        return;
    }
    const deltas = keys.map(k => getMotionDirection(k));
    const sumDelta = deltas.reduce(
        (acc, d) => ({x: acc.x + d.x, y: acc.y + d.y}),
        {x: 0, y: 0});
    const clampedDelta = {
        x: Math.sign(sumDelta.x),
        y: Math.sign(sumDelta.y),
    };
    if (clampedDelta.x === 0 && clampedDelta.y === 0) {
        return;
    }
    const slowness = 90;  // frames to traverse full canvas
    const velocityX = getCanvas().width / slowness;
    const velocityY = getCanvas().height / slowness;
    const finalDeltas = {
        x: velocityX * clampedDelta.x,
        y: velocityY * clampedDelta.y,
    };
    setState({
        ...state,
        coreState: CanvasCore.performPan(state.coreState, finalDeltas),
    });
}
