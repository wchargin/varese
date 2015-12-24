/*
 * Some useful pre-defined and centralized functions for testing purposes.
 */

// Alias and rename some React-provided testing utilities.
export {
    Simulate,
    renderIntoDocument,
    findRenderedDOMComponentWithTag as findOneWithTag,
    scryRenderedDOMComponentsWithTag as scryManyWithTag,
} from 'react-addons-test-utils';
