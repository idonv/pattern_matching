const _ = require('lodash');

module.exports = {
    _isAConstructorFunction(potentialConstructor) {
        return !!potentialConstructor.prototype && !!potentialConstructor.prototype.constructor.name;
    },

    constructResult(returnValue) {
        if (typeof returnValue === 'function' && !this._isAConstructorFunction(returnValue)) {
            return returnValue();
        }

        return returnValue;
    },

    _tryGetPatternFromFactory(patternFactory, value) {
        if (typeof patternFactory === 'function') {
            return patternFactory(value);
        }

        return patternFactory;
    },

    is(value, pattern) {
        pattern = this._tryGetPatternFromFactory(pattern);
        return value === pattern;
    },

    in(value, pattern) {
        if (!pattern[Symbol.iterator]) {
            throw new Error('Pattern is not iterable')
        }

        pattern = this._tryGetPatternFromFactory(pattern, value);

        for (const item of pattern) {
            if (this.equal(value, item)) {
                return true;
            }
        }

        return false;
    },

    regex(value, pattern) {
        if (typeof value !== 'string') {
            throw new Error('The value must be a string');
        }

        pattern = this._tryGetPatternFromFactory(pattern, value);

        const regex = new RegExp(pattern);
        return value.match(regex)?.length > 0;
    },

    equal(value, pattern) {
        pattern = this._tryGetPatternFromFactory(pattern, value);
        return _.isEqual(value, pattern);
    },

    first(collection, predicate) {
        return _.find(collection, predicate)
    }
}