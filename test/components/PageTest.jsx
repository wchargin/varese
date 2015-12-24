import {describe, it} from 'mocha';
import {expect} from 'chai';

import React from 'react';
import {
    renderIntoDocument,
    scryManyWithTag,
} from '../TestUtils';
import {scryRenderedDOMComponentsWithClass} from 'react-addons-test-utils';

import Page from '../../src/components/Page';

describe('Page', () => {

    const component = <Page path="tree">
        <div>
            <h1>Content!</h1>
            <span className="amazing-stuff">Inspiring!</span>
        </div>
    </Page>;
    const render = () => renderIntoDocument(component);

    it("renders its children", () => {
        const component = render();
        const spans = scryRenderedDOMComponentsWithClass(
            component, 'amazing-stuff');
        expect(spans).to.have.length(1);
        expect(spans[0].textContent).to.equal('Inspiring!');
    });

    it("marks the current page as active", () => {
        const component = render();
        const activeLinks = scryRenderedDOMComponentsWithClass(
            component, 'active');
        expect(activeLinks).to.have.length(1);
        expect(activeLinks[0].textContent).to.equal('Tree explorer');
    });

    it("marks other pages as inactive", () => {
        const component = render();
        const inactiveLinks = scryManyWithTag(component, 'li')
            .filter(x => !x.className.match(/\bactive\b/));
        expect(inactiveLinks).to.have.length.at.least(1);
        expect(inactiveLinks.find(x => x.textContent === 'Root calculator'))
            .to.not.equal(undefined);
    });

});
