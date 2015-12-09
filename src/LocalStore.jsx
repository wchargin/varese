// Borrowed heavily from Khan Academy's LocalStore
// and KaVideoPlayer's SafeLocalStore.
const LocalStore = {
    // Bump this to expire all old values.
    version: 1,
    keyPrefix: "varese",

    cacheKey(key) {
        if (!key) {
            throw new Error("Falsy key provided to cacheKey: " + key);
        }
        return [this.keyPrefix, this.version, key].join(":");
    },

    get(key, whenUnavailable) {
        if (!this.isEnabled()) {
            return whenUnavailable;
        }
        try {
            const data = window.localStorage[this.cacheKey(key)];
            if (data) {
                return JSON.parse(data);
            } else {
                return whenUnavailable;
            }
        } catch (e) {
            // If we had trouble retrieving, like FF's NS_FILE_CORRUPTED
            // http://stackoverflow.com/questions/18877643/error-in-local-storage-ns-error-file-corrupted-firefox
        }
        return null;
    },

    set(key, data) {
        if (!this.isEnabled()) {
            return;
        }
        const stringified = JSON.stringify(data);

        try {
            window.localStorage[this.cacheKey(key)] = stringified;
        } catch (e) {
            // I'll never go over the limit for this app, right?
            // (yeah, yeah, famous last words)
            if (window.console) {
                console.warn(e);
            }
        }
    },

    /**
     * Delete whatever data was associated with key
     */
    del(key) {
        if (!this.isEnabled()) {
            return;
        }
        const cacheKey = this.cacheKey(key);
        if (cacheKey in window.localStorage) {
            // (IE throws when deleting a non-existent entry.)
            delete window.localStorage[cacheKey];
        }
    },

    /*
     * Local storage might be disabled in old browsers
     * or in Safari's private browsing mode.
     * Don't die.
     */
    isEnabled() {
        var enabled, uid = String(+(new Date));
        try {
            window.sessionStorage[uid] = uid;
            enabled = (window.sessionStorage[uid] === uid);
            window.sessionStorage.removeItem(uid);
            return enabled;
        } catch (e) {
            return false;
        }
    },

};
window.LocalStore = LocalStore;
export default LocalStore;
