const utils = require('./utils');

module.exports.Matcher = class Matcher {
    #clauses;
    #default;

    constructor(clauses, defaultValue) {
        this.#clauses = clauses;
        this.#default = defaultValue;
    }

    #getDefault() {
        if (this.#default) {
            return utils.constructResult(this.#default);
        }

        return null;
    }

    match(value) {
        const result = utils.first(this.#clauses, ({ pattern, op, not }) => utils[op](value, pattern) !== not)
        return result ? utils.constructResult(result.returnValue) : this.#getDefault();
    }
}

module.exports.MultiMatcher = class MultiMatcher {
    #clauses;
    #default;
    #options;

    constructor(clauses, defaultValue, options) {
        this.#clauses = clauses;
        this.#default = defaultValue;
        this.#options = options;
    }

    #getDefault() {
        if (this.#default) {
            return [{ case: -1, value: utils.constructResult(this.#default) }];
        }

        return null;
    }

    match(value) {
        let results = [], caseId = this.#options.zeroBased ? 0 : 1;
        for (const { pattern, returnValue, op, not } of this.#clauses) {
            const operationSuccess = utils[op](value, pattern) !== not;

            if (operationSuccess) {
                const result = { case: caseId++, value: utils.constructResult(returnValue) };
                results.push(result);
            }
        }

        return results.length ? results : this.#getDefault();
    }
}
