/*
 * Some useful pre-defined and centralized functions for testing purposes.
 */
import {before, after} from 'mocha';

// Alias and rename some React-provided testing utilities.
export {
    Simulate,
    renderIntoDocument,
    findRenderedDOMComponentWithTag as findOneWithTag,
    scryRenderedDOMComponentsWithTag as scryManyWithTag,
    findRenderedDOMComponentWithClass as findOneWithClass,
    scryRenderedDOMComponentsWithClass as scryManyWithClass,
} from 'react-addons-test-utils';

/*
 * Create a box holding some mutable state (let-over-lambda style),
 * and return an accessor 'getBox' and a mutator 'setBox'.
 * This is useful for testing event handlers, e.g.:
 *
 *      const {getBox, setBox} = makeBox(0);
 *      const component = <button onClick={() => setBox(getBox() + 1)} />;
 *      const rendered = renderIntoDocument(component);
 *      const button = findOneWithTag(rendered, 'button');
 *      expect(getBox()).to.equal(0);
 *      Simulate.click(button);
 *      expect(getBox()).to.equal(1);
 *      Simulate.click(button);
 *      expect(getBox()).to.equal(2);
 *
 * Of course, you can accomplish the same thing with mutation in the test code,
 * but it's nice to provide a (somewhat more) pure wrapper around that.
 */
export function makeBox(initialValue = null) {
    let box = initialValue;
    return {
        getBox() {
            return box;
        },
        setBox(value) {
            box = value;
        },
    };
}

/*
 * Mock out a property while running a callback.
 * Example usage: mocking(window, 'setInterval', mySetInterval, () => { ... }).
 */
export function mocking(target, propertyName, newValue, callback) {
    const oldExisted = Object.prototype.hasOwnProperty.call(
        target, propertyName);
    const oldValue = target[propertyName];
    target[propertyName] = newValue;
    callback();
    if (oldExisted) {
        target[propertyName] = oldValue;
    } else {
        delete target[propertyName];
    }
}

/*
 * Ask Mocha to mock out a property within the current context.
 *
 * Example usage:
 *
 *      const mySetInterval = () => {};
 *      describe("before the mock", () =>
 *          it("isn't mocked", () =>
 *              expect(window.setInterval).to.not.equal(mySetInterval)));
 *      describe("a thing", () => {
 *          declareMochaMock(window, 'setInterval', mySetInterval);
 *          it("uses the mock", () =>
 *              expect(window.setInterval).to.equal(mySetInterval));
 *          it("uses the mock again", () =>
 *              expect(window.setInterval).to.equal(mySetInterval));
 *      });
 *      describe("after the mock", () =>
 *          it("isn't mocked", () =>
 *              expect(window.setInterval).to.not.equal(mySetInterval)));
 */
export function declareMochaMock(target, propertyName, newValue) {
    let oldExisted;
    let oldValue;
    before(`set up mock for '${propertyName}'`, () => {
        oldValue = target[propertyName]
        oldExisted = Object.prototype.hasOwnProperty.call(
            target, propertyName);
        target[propertyName] = newValue;
    });
    after(`tear down mock for '${propertyName}'`, () => {
        if (oldExisted) {
            target[propertyName] = oldValue;
        } else {
            delete target[propertyName];
        }
    });
}
