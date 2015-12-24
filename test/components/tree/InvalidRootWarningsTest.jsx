import {describe, it} from 'mocha';
import {expect} from 'chai';

import React from 'react';
import {
    renderIntoDocument,
    scryManyWithClass,
} from '../../TestUtils';
import {canonicalRationalizer} from '../../TestData';
import Rational from '../../../src/core/Rational';
import {canonicalValues} from '../../../src/core/HarmonicData';
import {extendRationalizer} from '../../../src/core/HarmonicSeries';

import InvalidRootWarnings
    from '../../../src/components/tree/InvalidRootWarnings';

describe('InvalidRootWarnings', () => {
    const getAlerts = component =>
        scryManyWithClass(renderIntoDocument(component), 'alert');
    const ensureQuestionMark = alertElement =>
        expect(alertElement.textContent).to.contain("question mark");

    it("should render no warnings when all the chords are okay", () =>
        expect(getAlerts(<InvalidRootWarnings
            chords={[[0, 4, 7], [-4, 0, 7], [0, 7, 11]]}
            rationalizer={canonicalRationalizer}
        />)).to.have.length(0));

    it("should render a warning for excessively large chords", () => {
        const alerts = getAlerts(<InvalidRootWarnings
            chords={[[0, 4, 7], [-4, 0, 7], [0, 7, 11e200]]}
            rationalizer={canonicalRationalizer}
        />);
        expect(alerts).to.have.length(1);
        expect(alerts[0].textContent).to.contain("complicated");
        alerts.forEach(ensureQuestionMark);
    });

    const zeroMinorSecondRationalizer = extendRationalizer([
        new Rational(0, 1),
        ...canonicalValues.slice(1),
    ]);

    it("should render a warning for a zero ratio", () => {
        const alerts = getAlerts(<InvalidRootWarnings
            chords={[[0, 4, 7], [0, 4, 6], [0, 4, 5]]}
            rationalizer={zeroMinorSecondRationalizer}
        />);
        expect(alerts).to.have.length(1);
        expect(alerts[0].textContent).to.contain("zero");
        alerts.forEach(ensureQuestionMark);
    });

    it("should be able to render multiple warnings at once", () => {
        const alerts = getAlerts(<InvalidRootWarnings
            chords={[[0, 4, 6], [0, 4, 5], [0, 4, 5e200]]}
            rationalizer={zeroMinorSecondRationalizer}
        />);
        expect(alerts).to.have.length(2);
        expect(alerts.find(x => x.textContent.match(/zero/)))
            .to.not.equal(undefined);
        expect(alerts.find(x => x.textContent.match(/complicated/)))
            .to.not.equal(undefined);
        alerts.forEach(ensureQuestionMark);
    });

});
