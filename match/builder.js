const { Matcher, MultiMatcher } = require('./matchers');
 
module.exports = class MatchBuilder {
    #clauses;
    #not = false;
    #options;
    #defualt;

    constructor(options) {
        this.#options = options;
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
        const { multiMatch } = this.#options ?? { multiMatch: false };
        const matcher = multiMatch ? new MultiMatcher(this.#clauses, this.#defualt, { zeroBased: this.#options.zeroBased }) : new Matcher(this.#clauses, this.#defualt);

        this.clear();
        return matcher;
    }
}