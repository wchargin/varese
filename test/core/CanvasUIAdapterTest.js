import {describe, it} from 'mocha';
import {expect} from 'chai';

import {makeBox, mocking, declareMochaMock} from '../TestUtils';
import {initialState as initialReduxState} from '../TestData';
const {treeViewOptions: initialViewOptions} = initialReduxState;

import * as CanvasCore from '../../src/core/CanvasCore';
import {
    createHandlers,
    createLifecycleMixins,
    initialState,
} from '../../src/core/CanvasUIAdapter';

describe('CanvasUIAdapter', () => {
    // Fix some dimensions so we get predictable results.
    const baseDimensions = { width: 600, height: 400 };
    const baseViewOptions = {
        ...initialViewOptions,
        infiniteLevels: 4,
        infiniteHeight: baseDimensions.height,
    };
    //
    // Utilities for generating the initial canvas state
    // and setting the view options.
    const s0 = (viewOptions = baseViewOptions) =>
        CanvasCore.setViewOptions(
            CanvasCore.setCanvasWidth(
                CanvasCore.initialState(),
                baseDimensions.width),
            viewOptions);
    //
    // Save a few characters when creating position vectors.
    const xy = (x, y) => ({ x, y });

    const create = () => {
        const {getBox, setBox} = makeBox(initialState(s0()));
        const canvas = { ...baseDimensions };
        return {
            getBox,
            setBox,
            canvas,
            handlers: createHandlers(getBox, setBox),
            lifecycleMixins:
                createLifecycleMixins(getBox, setBox, () => canvas),
        };
    };

    describe('#initialState', () => {
        const coreState = s0();
        it("should be a function", () =>
            expect(initialState).to.be.a('function'));
        it("should return an object", () =>
            expect(initialState(coreState)).to.be.an('object'));
        it("should have a 'coreState' matching the input", () =>
            expect(initialState(coreState))
                .to.have.property('coreState')
                .that.deep.equals(coreState));
    });

    describe('#createHandlers', () => {
        it("should be a function", () =>
            expect(createHandlers).to.be.a('function'));
        it("should return an object", () =>
            expect(create()).to.be.an('object'));
        it("should return an object with at least one property", () =>
            expect(Object.keys(create().handlers)).to.have.length.at.least(1));
        it("should return an object all of whose values are functions", () => {
            const handlers = create().handlers;
            Object.keys(handlers).forEach(key =>
                expect(handlers[key]).to.be.a('function'));
        });
    });

    describe('#createLifecycleMixins', () => {
        it("should be a function", () =>
            expect(createLifecycleMixins).to.be.a('function'));
        it("should return an object", () =>
            expect(create()).to.be.an('object'));
        it("should return an object with at least one property", () =>
            expect(Object.keys(create().lifecycleMixins))
            .to.have.length.at.least(1));
        it("should return an object all of whose values are functions", () => {
            const lifecycleMixins = create().lifecycleMixins;
            Object.keys(lifecycleMixins).forEach(key =>
                expect(lifecycleMixins[key]).to.be.a('function'));
        });
    });

    describe('handler onMouseDown', () => {
        const {getBox, handlers} = create();
        it("should be initialized with 'mouseDown' as false", () =>
            expect(getBox().mouseDown).to.equal(false));
        it("should set 'mouseDown' to true when false", () => {
            handlers.onMouseDown({});
            expect(getBox().mouseDown).to.equal(true);
        });
        it("should leave 'mouseDown' as true when already true", () => {
            handlers.onMouseDown({});
            expect(getBox().mouseDown).to.equal(true);
        });
    });

    describe('handler onMouseMove', () => {
        const {getBox, handlers} = create();
        it("should be initialized with a 'null' mouse position", () =>
            expect(getBox().lastMouse).to.equal(null));

        // Sample bounding rectangle for the canvas.
        // To produce this, just execute
        //     const canvas = document.getElementsByClassName('canvas')[0];
        //     canvas.getBoundingClientRect();
        // in a browser with the infinite canvas loaded.
        // (Of course, the values don't matter, but the shape does.)
        const boundingRect = {
            bottom: 800,
            height: 400,
            left: 300,
            right: 900,
            top: 200,
            width: 600,
        };
        const makeEvent = (relativeX, relativeY) => ({
            clientX: boundingRect.left + relativeX,
            clientY: boundingRect.top + relativeY,
            target: {
                getBoundingClientRect: () => boundingRect,
            },
        });
        it("should initialize 'lastMouse' while the mouse is up", () => {
            const e = makeEvent(200, 300);
            handlers.onMouseMove(e);
            expect(getBox().lastMouse).to.deep.equal(xy(200, 300));
            expect(getBox().coreState.position).to.deep.equal(xy(0, 0));
        });
        it("should update 'lastMouse' while the mouse is up", () => {
            const e = makeEvent(200, 250);  // 50px up from last
            handlers.onMouseMove(e);
            expect(getBox().lastMouse).to.deep.equal(xy(200, 250));
            expect(getBox().coreState.position).to.deep.equal(xy(0, 0));
        });
        it("when the mouse is down should pan and update 'lastMouse'", () => {
            handlers.onMouseDown({});
            const e = makeEvent(200, 100);  // 150px up from last
            handlers.onMouseMove(e);
            expect(getBox().lastMouse).to.deep.equal(xy(200, 100));
            expect(getBox().coreState.position).to.deep.equal(xy(0, 1.5));
        });
    });

    describe('handler onWheel', () => {

        // This one relies on document.activeElement for focus checking.
        // Happily, it looks like we can just set that property!
        const mockingFocus = (active, callback) =>
            mocking(document, 'activeElement', active, callback);
        const target = {};  // random dummy object to use for focusing

        const preventedDefault = makeBox(false);

        const {getBox, handlers} = create();
        const makeEvent = (deltaX, deltaY) => ({
            deltaX,
            deltaY,
            target,
            preventDefault: () => preventedDefault.setBox(true),
        });
        const resetPreventedDefault = () => preventedDefault.setBox(false);

        it("(1) should do nothing when scrolling while unfocused", () => {
            resetPreventedDefault();
            mockingFocus(null, () => handlers.onWheel(makeEvent(10, 20)));
            expect(preventedDefault.getBox()).to.equal(false);
            expect(getBox().coreState).to.deep.equal(s0());
        });

        it("then (2) should scroll vertically when focused", () => {
            resetPreventedDefault();
            mockingFocus(target, () => handlers.onWheel(makeEvent(0, 50)));
            expect(preventedDefault.getBox()).to.equal(true);
            expect(getBox().coreState.position).to.deep.equal(xy(0, 0.5));
        });

        it("then (3) should scroll diagonally", () => {
            resetPreventedDefault();
            mockingFocus(target, () => handlers.onWheel(makeEvent(300, 50)));
            expect(preventedDefault.getBox()).to.equal(true);
            expect(getBox().coreState.position).to.deep.equal(xy(0.25, 1));
        });

        it("then (4) should do nothing when unfocused again", () => {
            resetPreventedDefault();
            mockingFocus(null, () => handlers.onWheel(makeEvent(123, 234)));
            expect(preventedDefault.getBox()).to.equal(false);
            expect(getBox().coreState.position).to.deep.equal(xy(0.25, 1));
        });

        it("finally (5) should scroll horizontally", () => {
            resetPreventedDefault();
            mockingFocus(target, () => handlers.onWheel(makeEvent(-600, 0)));
            expect(preventedDefault.getBox()).to.equal(true);
            expect(getBox().coreState.position).to.deep.equal(xy(-0.25, 1));
        });

    });

    describe('handler onMouseUp', () => {
        const {getBox, handlers} = create();
        handlers.onMouseDown({});
        it("should set 'mouseDown' to false when true", () => {
            handlers.onMouseUp({});
            expect(getBox().mouseDown).to.equal(false);
        });
        it("should leave 'mouseDown' as false when already false", () => {
            handlers.onMouseUp({});
            expect(getBox().mouseDown).to.equal(false);
        });
    });

    describe('handler onMouseLeave', () => {
        const {getBox, handlers} = create();
        handlers.onMouseDown({});
        it("should set 'mouseDown' to false when true", () => {
            handlers.onMouseLeave({});
            expect(getBox().mouseDown).to.equal(false);
        });
        it("should leave 'mouseDown' as false when already false", () => {
            handlers.onMouseLeave({});
            expect(getBox().mouseDown).to.equal(false);
        });
    });

    describe('handler onKeyDown', () => {
        const {getBox, handlers} = create();
        const makeEvent = (which, repeat = false) => ({ which, repeat });
        it("should initialize 'keysDown' to an empty array", () =>
            expect(getBox().keysDown).to.deep.equal([]));
        it("should add a WASD key to 'keysDown'", () => {
            handlers.onKeyDown(makeEvent(0x41));  // 'A'
            expect(getBox().keysDown).to.deep.equal([0x41]);
        });
        it("shouldn't add a non-directional key to 'keysDown'", () => {
            handlers.onKeyDown(makeEvent(0x42));  // 'B'
            expect(getBox().keysDown).to.deep.equal([0x41]);
        });
        it("shouldn't add a mashed ('repeat') key to 'keysDown'", () => {
            handlers.onKeyDown(makeEvent(0x44, true));  // 'D'
            expect(getBox().keysDown).to.deep.equal([0x41]);
        });
        it("should add an arrow key to 'keysDown'", () => {
            handlers.onKeyDown(makeEvent(0x28));  // 'Down'
            expect(getBox().keysDown).to.deep.equal([0x41, 0x28]);
        });
        it("shouldn't add the most recent key again", () => {
            handlers.onKeyDown(makeEvent(0x28));  // 'Down'
            expect(getBox().keysDown).to.deep.equal([0x41, 0x28]);
        });
        it("shouldn't add a previous key again", () => {
            handlers.onKeyDown(makeEvent(0x41));  // 'A'
            expect(getBox().keysDown).to.deep.equal([0x41, 0x28]);
        });
        it("should add one more key, to make sure it's not broken", () => {
            handlers.onKeyDown(makeEvent(0x44));  // 'D'
            expect(getBox().keysDown).to.deep.equal([0x41, 0x28, 0x44]);
        });
    });

    describe('handler onKeyUp', () => {
        const {getBox, handlers} = create();
        const makeEvent = which => ({ which, repeat: false });
        it("should release a key that was down", () => {
            handlers.onKeyDown(makeEvent(0x41));  // 'A'
            handlers.onKeyUp(makeEvent(0x41));    // 'A'
            expect(getBox().keysDown).to.have.length(0);
        });
        it("should leave other keys pressed", () => {
            handlers.onKeyDown(makeEvent(0x57));  // 'W'
            handlers.onKeyDown(makeEvent(0x41));  // 'A'
            handlers.onKeyDown(makeEvent(0x53));  // 'S'
            handlers.onKeyUp(makeEvent(0x41));    // 'A'
            expect(getBox().keysDown).to.deep.equal([0x57, 0x53]);
        });
        it("should leave unpressed keys alone", () => {
            handlers.onKeyUp(makeEvent(0x44));    // 'D'
            expect(getBox().keysDown).to.deep.equal([0x57, 0x53]);
        });
        it("should leave non-movement keys alone", () => {
            handlers.onKeyUp(makeEvent(0x45));    // 'E'
            expect(getBox().keysDown).to.deep.equal([0x57, 0x53]);
        });
    });

    describe('handler onBlur', () => {
        const {getBox, handlers} = create();
        const makeEvent = which => ({ which, repeat: false });
        it("should release all held keys", () => {
            handlers.onKeyDown(makeEvent(0x41));  // 'A'
            handlers.onKeyDown(makeEvent(0x44));  // 'D'
            handlers.onBlur();
            expect(getBox().keysDown).to.have.length(0);
        });
    });

    describe('lifecycle mixin componentWillMount', () => {
        const {getBox, lifecycleMixins} = create();
        const newViewOptions = {
            ...baseViewOptions,
            infiniteLevels: baseViewOptions.infiniteLevels + 1,
        };
        const component = { props: { viewOptions: newViewOptions } };
        it("should update the core state's view options", () => {
            expect(getBox().coreState.viewOptions)
                .to.deep.equal(baseViewOptions);
            lifecycleMixins.componentWillMount.call(component);
            expect(getBox().coreState.viewOptions)
                .to.deep.equal(newViewOptions);
        });
    });

    describe('lifecycle mixin componentDidMount', () => {
        const {getBox, canvas, handlers, lifecycleMixins} = create();

        // We'll use this box as the mock for 'getComputedStyle'.
        const {getBox: getWidthBox, setBox: setWidthBox} = makeBox();
        const mockedGetComputedStyle = (element) => {
            expect(element).to.equal(canvas);
            return { width: getWidthBox() };
        };
        declareMochaMock(window, 'getComputedStyle', mockedGetComputedStyle);

        // We'll use this box to store whatever event listener the mixin sets.
        const {getBox: getListenerBox, setBox: setListenerBox} = makeBox();
        const mockedAddEventListener = (name, fn) => {
            expect(name).to.equal('resize');
            setListenerBox(fn);
        };
        declareMochaMock(window, 'addEventListener', mockedAddEventListener);

        // Finally, we'll use this box for the 'setInterval' callback.
        const setIntervalReturnValue = 66;
        const {getBox: getIntervalBox, setBox: setIntervalBox} = makeBox();
        const mockedSetInterval = (fn, time) => {
            expect(time).to.be.within(1, 100);
            setIntervalBox(fn);
            return setIntervalReturnValue;
        };
        declareMochaMock(window, 'setInterval', mockedSetInterval);

        it("executes without error", () => {
            setWidthBox("234px");  // not the initial value
            lifecycleMixins.componentDidMount.call({});
        })
        it("sets a listener", () => {
            expect(getListenerBox()).to.be.a('function');
        });
        it("sets an interval", () => {
            expect(getIntervalBox()).to.be.a('function');
        });
        it("updates the width on mount", () => {
            expect(canvas.width).to.equal(234);
            expect(getBox().coreState.canvasWidth).to.equal(234);
        });
        it("sets a listener that properly updates the width", () => {
            setWidthBox("345px");
            getListenerBox()();  // simulate resizing the window
            expect(canvas.width).to.equal(345);
            expect(getBox().coreState.canvasWidth).to.equal(345);
        });
        describe("key interval", () => {
            const getPosition = () => getBox().coreState.position;
            it("doesn't change the initialized value", () =>
                expect(getPosition()).to.deep.equal(xy(0, 0)));
            it("moves when a key is just pressed", () => {
                const previous = getPosition();
                handlers.onKeyDown({ which: 0x53, repeat: false });  // 'S'
                getIntervalBox()();
                const next = getPosition();
                expect(next.y).to.be.greaterThan(previous.y);
                expect(next.x).to.equal(previous.x);
            });
            it("moves while a key is still pressed", () => {
                const previous = getPosition();
                getIntervalBox()();
                const next = getPosition();
                expect(next.y).to.be.greaterThan(previous.y);
                expect(next.x).to.equal(previous.x);
            });
            it("moves in two directions at once", () => {
                const previous = getPosition();
                handlers.onKeyDown({ which: 0x41, repeat: false });  // 'A'
                getIntervalBox()();
                const next = getPosition();
                expect(next.y).to.be.greaterThan(previous.y);
                expect(next.x).to.be.lessThan(previous.x);
            });
            it("discards a key once it's been released", () => {
                const previous = getPosition();
                handlers.onKeyUp({ which: 0x53 });  // 'S'
                getIntervalBox()();
                const next = getPosition();
                expect(next.y).to.equal(previous.y);
                expect(next.x).to.be.lessThan(previous.x);
            });
            it("does nothing once all keys have been released", () => {
                const previous = getPosition();
                handlers.onKeyUp({ which: 0x41 });  // 'A'
                getIntervalBox()();
                getIntervalBox()();
                getIntervalBox()();
                const next = getPosition();
                expect(next).to.deep.equal(previous);
            });
            it("does nothing while two opposing keys are pressed", () => {
                const previous = getPosition();
                handlers.onKeyDown({ which: 0x44 });  // 'D'
                handlers.onKeyDown({ which: 0x25 });  // Left
                getIntervalBox()();
                getIntervalBox()();
                getIntervalBox()();
                const next = getPosition();
                expect(next).to.deep.equal(previous);
            });
            it("moves while two opposing keys and a third are pressed", () => {
                const previous = getPosition();
                handlers.onKeyDown({ which: 0x26 });  // Up
                getIntervalBox()();
                const next = getPosition();
                expect(next.y).to.be.lessThan(previous.y);
                expect(next.x).to.equal(previous.x);
            });
        });
    });

    describe('lifecycle mixin componentWillReceiveProps', () => {
        const {getBox, lifecycleMixins} = create();
        const makeViewOptions = delta => ({
            ...baseViewOptions,
            infiniteLevels: baseViewOptions.infiniteLevels + delta,
        });
        it("shouldn't do anything when the view options don't change", () => {
            const oldState = getBox();
            const oldViewOptions = makeViewOptions(0);
            const component = {
                props: {
                    viewOptions: oldViewOptions,
                    unrelatedProp: 218,
                },
            };
            const newProps = {
                viewOptions: oldViewOptions,
                unrelatedProp: 616,
            };
            lifecycleMixins.componentWillReceiveProps.call(
                component, newProps);
            const newState = getBox();
            expect(newState).to.equal(oldState);  // not deep equal!
        });
        it("should update the view options when new ones come in", () => {
            const oldViewOptions = makeViewOptions(0);
            const newViewOptions = makeViewOptions(995);
            const component = {
                props: {
                    viewOptions: oldViewOptions,
                    unrelatedProp: 218,
                },
            };
            const newProps = {
                viewOptions: newViewOptions,
                unrelatedProp: 218,
            };
            lifecycleMixins.componentWillReceiveProps.call(
                component, newProps);
            const newState = getBox();
            expect(newState.coreState.viewOptions)
                .to.deep.equal(newViewOptions);
        });
    });

    describe('lifecycle mixin componentDidUpdate', () => {
        const {getBox, canvas, handlers, lifecycleMixins} = create();

        // We'll use this box as the mock for 'getComputedStyle'.
        const {getBox: getWidthBox, setBox: setWidthBox} = makeBox();
        const mockedGetComputedStyle = (element) => {
            expect(element).to.equal(canvas);
            return { width: getWidthBox() };
        };
        declareMochaMock(window, 'getComputedStyle', mockedGetComputedStyle);

        // We'll use this box to store whatever event listener the mixin sets.
        const {getBox: getListenerBox, setBox: setListenerBox} = makeBox();
        const mockedAddEventListener = (name, fn) => {
            expect(name).to.equal('resize');
            setListenerBox(fn);
        };
        declareMochaMock(window, 'addEventListener', mockedAddEventListener);

        // We just ignore the 'setInterval' callback.
        declareMochaMock(window, 'setInterval', () => {});

        it("can still mount the component", () => {
            setWidthBox("800px");
            lifecycleMixins.componentDidMount.call({});
        });
        it("updates the width on update", () => {
            setWidthBox("777px");
            lifecycleMixins.componentDidUpdate.call({});
            expect(canvas.width).to.equal(777);
        });
        it("updates the state on update", () => {
            setWidthBox("999px");
            lifecycleMixins.componentDidUpdate.call({});
            expect(getBox().coreState.canvasWidth).to.equal(999);
        });
    });

});
