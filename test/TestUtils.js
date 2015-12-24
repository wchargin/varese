/*
 * Some useful pre-defined and centralized functions for testing purposes.
 */

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
