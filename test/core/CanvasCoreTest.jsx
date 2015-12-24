import {describe, it} from 'mocha';
import {expect} from 'chai';

import * as CanvasCore from '../../src/core/CanvasCore';

describe('CanvasCore', () => {

    it("provides an initial state", () =>
        expect(CanvasCore.initialState()).to.be.an('object'));

});
