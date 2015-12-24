import {describe, it} from 'mocha';
import {expect} from 'chai';

import React from 'react';
import {
    renderIntoDocument,
    scryManyWithTag,
    scryManyWithClass,
} from '../TestUtils';

import Page from '../../src/components/Page';

describe('Page', () => {

    const links = [
        { path: "alpha", name: "The first"  },
        { path: "beta",  name: "The second" },
        { path: "gamma", name: "The third", flag: "radiation danger" },
    ];
    const component = <Page path="beta" links={links}>
        <div>
            <h1>Content!</h1>
            <span className="amazing-stuff">Inspiring!</span>
        </div>
    </Page>;
    const render = () => renderIntoDocument(component);

    it("renders its children", () => {
        const component = render();
        const spans = scryManyWithClass(component, 'amazing-stuff');
        expect(spans).to.have.length(1);
        expect(spans[0].textContent).to.equal('Inspiring!');
    });

    it("renders all types of links properly", () => {
        const component = render();
        const links = scryManyWithTag(component, 'li');
        expect(links).to.have.length(3);

        // Inactive link.
        expect(links[0].textContent).to.equal("The first");

        // Active link.
        expect(links[1].textContent).to.equal("The second");

        // Link with a flag. 'gammaLink' takes on the following shape:
        // <li><a><span>Name</span><span red>[thicksp]FLAG</span></a></li>
        // (The <a> tag comes from React Router.)
        const gammaLink = links[2];
        const gammaSpans = gammaLink.childNodes[0].childNodes;
        expect(gammaSpans).to.have.length(2);
        expect(gammaSpans[0].textContent).to.equal("The third");
        expect(gammaSpans[1].textContent).to.equal("\u2002RADIATION DANGER");
        expect(gammaSpans[1].style.color).to.equal("red");
    });

    it("marks the current page as active", () => {
        const component = render();
        const activeLinks = scryManyWithClass(component, 'active');
        expect(activeLinks).to.have.length(1);
        expect(activeLinks[0].textContent).to.equal("The second");
    });

    it("marks other pages as inactive", () => {
        const component = render();
        const inactiveContent = scryManyWithTag(component, 'li')
            .filter(x => !x.className.match(/\bactive\b/))
            .map(x => x.textContent);
        expect(inactiveContent).to.have.length(2);
        expect(inactiveContent[0]).to.equal("The first");
        expect(inactiveContent[1]).to.contain("The third");
    });

});
