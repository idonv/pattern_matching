const { Matcher, MultiMatcher } = require('./matchers');
 
const defaultOptions = { multiMatch: false, zeroBased: false };

module.exports = class MatchBuilder {
    #clauses;
    #not = false;
    #options;
    #defualt;

    constructor(options) {
        this.#options = options ? { ...defaultOptions, ...options } : defaultOptions;
        this.#clauses = [];
    }

    case(pattern, returnValue, op = 'equal') {
        this.#clauses.push({ pattern, returnValue, op, not: this.#not });
        this.#not = false;
        return this;
    }

    get not() {
        this.#not = true;
        return this;
    }

    default(defaultValue) {
        if (this.#defualt === undefined) {
            this.#defualt = defaultValue;
        }

        return { construct: this.construct.bind(this) }
    }

    in(pattern, returnValue) {
        return this.case(pattern, returnValue, 'in');
    }

    equal(pattern, returnValue) {
        return this.case(pattern, returnValue, 'equal');
    }

    is(pattern, returnValue) {
        return this.case(pattern, returnValue, 'is');
    }

    regex(pattern, returnValue) {
        return this.case(pattern, returnValue, 'regex');
    }

    clear() {
        this.#clauses = [];
        this.#defualt = undefined;
    }

    construct() {
        const { multiMatch } = this.#options;
        const matcher = multiMatch ? new MultiMatcher(this.#clauses, this.#defualt, this.#options) : new Matcher(this.#clauses, this.#defualt);

        this.clear();
        return matcher;
    }
}