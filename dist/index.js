import { ref, watch } from 'vue';
/** @returns true if both arrays have the same elements. Will still return true
 * if they are in a different order. */
function arraysMatch(a, b) {
    if (a.length != b.length)
        return false;
    let bMutable = [...b];
    for (let i = 0; i < a.length; i++) {
        const curr = a[i];
        let j = bMutable.findIndex(c => c == curr);
        if (j == -1) {
            return false;
        }
        else {
            delete bMutable[j];
        }
    }
    return true;
}
/** Attempts to compress strings to the smallest unique substring possible. If
 * this fails, it will come up with a new unique string */
function minifyStrings(inputs) {
    let output = {};
    let backup = 0;
    // Iterate through words
    for (let i = 0, len = inputs.length; i < len; i++) {
        const word = inputs[i];
        if (word.length == 0) {
            throw new Error(`Found word of length 0 at index ${i} in ${JSON.stringify(inputs)}`);
        }
        let start = 0, length = 1;
        let identifier = word.slice(start, start + length);
        // Find the shortest possible unique part of this string (starting with an
        // identifier 1 character long)
        while (Object.values(output).includes(identifier)) {
            if (start < word.length - length) {
                start++;
            }
            else {
                start = 0;
                length++;
                if (length > word.length) {
                    // In this case, we can't find a unique identifier, so try appending
                    // to the string.
                    identifier = backup.toString(36);
                    backup++;
                    continue;
                }
            }
            identifier = word.slice(start, start + length);
        }
        output[word] = identifier;
    }
    return output;
}
/**
 * For shorter urls, queries of type string[] are shortened with
 * uniqueStringParts and then concatenated together with no separator. This
 * function decodes the query string and returns a string[]
 */
function parseUrlArrayQuery(queryString, allowedValues) {
    const response = [];
    let start = 0, length = 1;
    while (start + length <= queryString.length) {
        let slice = queryString.slice(start, start + length);
        while (!Object.values(allowedValues).includes(slice)) {
            length++;
            slice = queryString.slice(start, start + length);
            if (length > queryString.length) {
                throw new Error('Invalid query');
            }
        }
        const [longName] = Object.entries(allowedValues).find(a => a[1] == slice);
        response.push(longName);
        start += length;
        length = 1;
    }
    return response;
}
export default class ReactiveQuery {
    constructor(args) {
        /**
         * Usage:
         * ```
         * const query = new ReactiveQuery()
         *   .createBooleanParam('happy', true)
         *   // ...define more params
         *
         *   .minifyIdentifiers()
         *
         * const shortNames = query.names
         * ```
         */
        this.minifyIdentifiers = () => {
            let inputs = Object.keys(this.refs);
            this.names = minifyStrings(inputs);
            // Convert long names in the URL to short ones
            const searchParams = this.route.query;
            for (let i = 0; i < Object.entries(this.names).length; i++) {
                const [longName, shortName] = Object.entries(this.names)[i];
                const searchParam = searchParams[longName]?.toString();
                if (searchParam) {
                    this.router.replace({
                        query: {
                            ...this.route.query,
                            ...{ [longName]: undefined },
                            ...{ [shortName]: searchParam }
                        }
                    });
                }
            }
            return this;
        };
        /** Returns the value of the query param from the current URL. */
        this.fromUrl = (name) => {
            // Search for full names and short names in the url
            // This way you can link to this page with the full name (which is easier to
            // type). You may also not know a long name's short name at runtime.
            return (this.route.query[this.names[name]]?.toString() ||
                this.route.query[name]?.toString());
        };
        this.setQuery = (key, val) => {
            let identifier = this.names[key] ?? key;
            this.router.replace({
                query: {
                    ...this.route.query,
                    ...{ [key]: undefined },
                    ...{ [identifier]: val }
                }
            });
        };
        this.createStringListParam = (name, defaultValue, allowedValues) => {
            let re;
            this.defaults[name] = defaultValue;
            let fromUrl = this.fromUrl(name);
            const allowedValuesShrunk = allowedValues
                ? minifyStrings(allowedValues)
                : undefined;
            if (allowedValuesShrunk) {
                re = ref(fromUrl
                    ? parseUrlArrayQuery(fromUrl, allowedValuesShrunk)
                    : defaultValue);
            }
            else {
                re = ref(fromUrl ? fromUrl.split(',') : defaultValue);
            }
            watch(re, value => {
                console.log(JSON.stringify(re.value));
                if (arraysMatch(defaultValue, value)) {
                    console.log('match');
                    console.log(JSON.stringify(re.value));
                    this.setQuery(name, undefined);
                    return;
                }
                if (allowedValuesShrunk) {
                    let pendingArr = [];
                    for (let i = 0; i < value.length; i++) {
                        const v = value[i];
                        if (v in allowedValuesShrunk) {
                            pendingArr.push(allowedValuesShrunk[v]);
                        }
                    }
                    this.setQuery(name, pendingArr.join(''));
                    return;
                }
                this.setQuery(name, value.join(','));
            });
            this.refs[name] = re;
            return this;
        };
        this.createStringParam = (name, defaultValue, allowedValues) => {
            const fromUrl = this.fromUrl(name);
            this.defaults[name] = defaultValue;
            const re = ref(fromUrl ?? defaultValue);
            watch(re, value => {
                if (value == defaultValue) {
                    this.setQuery(name, undefined);
                    return;
                }
                if (allowedValues) {
                    const allowedValuesShrunk = minifyStrings(allowedValues);
                    if (value in allowedValuesShrunk) {
                        this.setQuery(name, allowedValuesShrunk[value]);
                        return;
                    }
                    this.setQuery(name, defaultValue);
                    return;
                }
                this.setQuery(name, value);
            });
            this.refs[name] = re;
            return this;
        };
        /**
         * This technically works with floats too, but it converts strings to base-36
         * to save space. Use .createFloatParam() if you want to leave them in base 10.
         */
        this.createIntParam = (name, defaultValue) => {
            const fromUrl = parseInt(this.fromUrl(name) ?? '_', 36);
            this.defaults[name] = defaultValue;
            const re = ref(isNaN(fromUrl) ? defaultValue : fromUrl);
            watch(re, value => {
                if (value == defaultValue) {
                    this.setQuery(name, undefined);
                    return;
                }
                this.setQuery(name, value.toString(36));
            });
            this.refs[name] = re;
            return this;
        };
        /**
         * This technically works with floats too, but it converts strings to base-36
         * to save space. Use .createFloatParam() if you want to leave them in base 10.
         */
        this.createFloatParam = (name, defaultValue) => {
            const fromUrl = parseFloat(this.fromUrl(name) ?? '_');
            this.defaults[name] = defaultValue;
            const re = ref(isNaN(fromUrl) ? defaultValue : fromUrl);
            watch(re, value => {
                if (value == defaultValue) {
                    this.setQuery(name, undefined);
                    return;
                }
                this.setQuery(name, value.toString(10));
            });
            this.refs[name] = re;
            return this;
        };
        this.createBooleanParam = (name, defaultValue) => {
            const fromUrl = this.fromUrl(name);
            const re = ref(fromUrl == '1' ? true : fromUrl == '0' ? false : defaultValue);
            watch(re, value => {
                console.log(value, defaultValue);
                if (re.value == defaultValue) {
                    this.setQuery(name, undefined);
                    return;
                }
                this.setQuery(name, value ? '1' : '0');
            });
            this.refs[name] = re;
            return this;
        };
        console.log(args);
        this.route = args.route;
        this.router = args.router;
        this.refs = {};
        this.names = {};
        this.defaults = {};
    }
}
//# sourceMappingURL=index.js.map