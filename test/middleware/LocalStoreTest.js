import {describe, it} from 'mocha';
import {expect} from 'chai';

import {declareMochaMock, mocking} from '../TestUtils';

import LocalStore from '../../src/middleware/LocalStore';

describe('LocalStore', () => {
    const sessionStorageEnabled = {
        removeItem(key) {
            delete this[key];
        },
    };
    const sessionStorageDisabled = {
        removeItem() {
            throw new Error("No dice");
        },
    };
    declareMochaMock(window, 'sessionStorage', sessionStorageEnabled);

    it("gets a JSON-readable entry from localStorage", () => {
        const key = 'magic';
        const cacheKey = LocalStore.cacheKey(key);
        const value = { third: 'twelfth', upsilon: [1, 2, 3] };
        const localStorage = { [cacheKey]: JSON.stringify(value) };
        mocking(window, 'localStorage', localStorage,
            () => expect(LocalStore.get(key)).to.deep.equal(value));
    });

    it("gets the fallback value when there is no entry", () => {
        mocking(window, 'localStorage', {},
            () => expect(LocalStore.get('nope', 3)).to.equal(3));
    });

    it("gets the fallback upon failing to read from localStorage", () => {
        const key = 'things';
        const cacheKey = LocalStore.cacheKey(key);
        const complain = () => {
            throw new Error("Disabled!");
        };
        const localStorage = Object.defineProperty({}, cacheKey, {
            get: complain,
            set: complain,
            enumerable: true,
        });
        mocking(window, 'localStorage', localStorage,
            () => expect(LocalStore.get(key, 3)).to.equal(3));
    });

    it("gets a JSON-readable entry from localStorage", () => {
        const key = 'amazing';
        const cacheKey = LocalStore.cacheKey(key);
        const localStorage = { };
        const value = ["one", true, 3.0];
        mocking(window, 'localStorage', localStorage,
            () => LocalStore.set(key, value));
        expect(localStorage[cacheKey]).to.deep.equal(JSON.stringify(value));
    });

    it("deletes an entry from localStorage", () => {
        const key = 'whee';
        const cacheKey = LocalStore.cacheKey(key);
        const localStorage = { [cacheKey]: JSON.stringify(77) };
        mocking(window, 'localStorage', localStorage,
            () => LocalStore.del(key));
        expect(localStorage).to.not.have.a.property(cacheKey);
    });

    it("does nothing when deleting a non-existent entry", () => {
        const key = 'plhebotinum';
        const cacheKey = LocalStore.cacheKey(key);
        const localStorage = { [cacheKey]: JSON.stringify(77) };
        mocking(window, 'localStorage', localStorage,
            () => LocalStore.del('flubber'));
        expect(localStorage).to.have.a.property(cacheKey);
    });

    it("knows when it's not enabled", () => {
        mocking(window, 'sessionStorage', sessionStorageDisabled,
            () => expect(LocalStore.isEnabled()).to.equal(false));
    });

    it("complains when the key is falsy", () => {
        expect(() => LocalStore.cacheKey(false)).to.throw(/key/);
    });

    describe("when not enabled", () => {
        declareMochaMock(window, 'sessionStorage', sessionStorageDisabled);
        const key = 'magic';
        const cacheKey = LocalStore.cacheKey(key);
        const complain = () => {
            throw new Error("Disabled!");
        };
        const localStorage = Object.defineProperty({}, cacheKey, {
            get: complain,
            set: complain,
        });
        declareMochaMock(window, 'localStorage', localStorage);
        it("returns the fallback value for a 'get'", () => {
            expect(LocalStore.get(key, 7)).to.equal(7);
        });
        it("returns undefined for a 'set'", () => {
            expect(LocalStore.set(key, 7)).to.equal(undefined);
        });
        it("returns undefined for a 'del'", () => {
            expect(LocalStore.del(key)).to.equal(undefined);
        });
        it("would fail if it didn't check for enabledness", () =>
           expect(() => localStorage[cacheKey]).to.throw);
    });

    it("throws an error when exceeding the memory limit", () => {
        const key = 'magic';
        const cacheKey = LocalStore.cacheKey(key);
        const localStorage = Object.defineProperty({}, cacheKey, {
            get: () => undefined,
            set: () => {
                throw new Error("Achtung! Gefahr! Out of memory!");
            },
        });
        mocking(window, 'localStorage', localStorage, () => {
            expect(() => LocalStore.set(key, 234)).to.throw(/Gefahr/);
        });
    });

});
