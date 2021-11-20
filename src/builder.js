const { Matcher, MultiMatcher } = require('./matchers');
const utils = require('./utils');
 
const defaultOptions = { multiMatch: false, zeroBased: false };

module.exports = class MatchBuilder {
    #clauses;
    #defualt;
    #not = false;
    #options;

    constructor(options) {
        this.#options = options ? { ...defaultOptions, ...options } : defaultOptions;
        this.#clauses = [];
    }

    case(pattern, returnValue, op = 'equal') {
        const selectedOp = utils.operations[op];

        if(!selectedOp) {
            throw new Error(`Invalid operation name "${op}". Supported operations: [${Object.keys(utils.operations)}].`);
        }

        this.#clauses.push({ pattern, returnValue, op: selectedOp, not: this.#not });
        this.#not = false;
        return this;
    }

    equal(pattern, returnValue) {
        return this.case(pattern, returnValue, 'equal');
    }

    in(pattern, returnValue) {
        return this.case(pattern, returnValue, 'in');
    }

    is(pattern, returnValue) {
        return this.case(pattern, returnValue, 'is');
    }

    get not() {
        this.#not = true;
        return this;
    }

    regex(pattern, returnValue) {
        return this.case(pattern, returnValue, 'regex');
    }

    section(pattern, returnValue) {
        return this.case(pattern, returnValue, 'section');
    }

    sub(pattern, returnValue) {
        return this.case(pattern, returnValue, 'sub');
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

    default(defaultValue) {
        if (this.#defualt === undefined) {
            this.#defualt = defaultValue;
        }

        return { construct: this.construct.bind(this) }
    }
}