const deepEqual = require('fast-deep-equal');

module.exports = {
    _countIterable(iterable) {
        if(iterable.length) {
            return iterable.length;
        }

        if(iterable.size) {
            return iterable.size;
        }

        if(iterable.reduce) {
            return iterable.reduce((count) => count + 1, 0);
        }
        let count = 0;
        for(const _ in iterable) {
            count++;
        }

        return count;
    },

    _isAConstructorFunction(potentialConstructor) {
        return !!potentialConstructor.prototype && !!potentialConstructor.prototype.constructor.name;
    },

    _isSection(set, subSet) {
        if(!subSet.length) {
            return false;
        } 

        for (let i = 0; i < set.length; i++) {
            const subset = set.slice(i, i + subSet.length)
            if (this.equal(subSet, subset)) {
                return true;
            }

            if (i + subSet.length > set.length) {
                return false;
            }
        }
    },

    _tryConvertToArray(candidate) {
        if(typeof candidate === 'string') {
            return candidate;
        }

        if (this.isIterator(candidate) && !Array.isArray(candidate)) {
            return [...candidate]
        }

        return candidate;
    },

    _tryGetPatternFromFactory(patternFactory, value) {
        if (typeof patternFactory === 'function') {
            return patternFactory(value);
        }

        return patternFactory;
    },

    constructResult(returnValue) {
        if (typeof returnValue === 'function' && !this._isAConstructorFunction(returnValue)) {
            return returnValue();
        }

        return returnValue;
    },

    isIterator(candidate) {
        return candidate[Symbol.iterator];
    },

    equal(value, pattern) {
        pattern = this._tryGetPatternFromFactory(pattern, value);
        return deepEqual(value, pattern);
    },

    first(clauses, predicate) {
        return clauses.find(predicate);
    },

    is(value, pattern) {
        pattern = this._tryGetPatternFromFactory(pattern);

        if (value !== value && pattern !== pattern) {
            return true;
        }

        return value === pattern;
    },

    in(value, pattern) {
        pattern = this._tryGetPatternFromFactory(pattern, value);

        if (!this.isIterator(pattern)) {
            throw new TypeError('Pattern is not iterable')
        }


        for (const item of pattern) {
            if (this.equal(value, item)) {
                return true;
            }
        }

        return false;
    },

    regex(value, pattern) {
        if (typeof value !== 'string') {
            throw new TypeError('The value must be a string');
        }

        pattern = this._tryGetPatternFromFactory(pattern, value);

        const regex = new RegExp(pattern);
        return value.match(regex)?.length > 0;
    },

    section(section, collection) {
        collection = this._tryGetPatternFromFactory(collection, section);

        if(typeof collection === 'string' && typeof section === 'string') {
            return collection.includes(section);
        }

        if (!this.isIterator(collection)) {
            throw new TypeError('Pattern is not iterable');
        }

        if(this.isIterator(section) && !Array.isArray(section)) {
            section = this._tryConvertToArray(section);
        }

        if (Array.isArray(section)) {
            collection = this._tryConvertToArray(collection);
            const lenDifference = collection.length - section.length;

            return lenDifference < 0 ? false : this._isSection(collection, section);
        }

        return this.in(section, collection);
    },

    sub(subSet, set) {
        set = this._tryGetPatternFromFactory(set, subSet);

        if (!this.isIterator(set)) {
            throw new TypeError('Pattern is not iterable');
        }

        if(this.isIterator(subSet)) {
            if(this._countIterable(subSet) > this._countIterable(set)) {
                return false;
            }

            for (const item of subSet) {
                let isInSet = false;
                for(const element of set) {
                    if(this.equal(element, item)) {
                        isInSet = true;
                        break;
                    }
                }

                if(!isInSet) {
                    return false;
                }
            }

            return true;
        }

        return this.in(value, pattern);
    },

    operations: {
        equal: 'equal',
        first: 'first',
        in: 'in',
        is: 'is',
        section: 'section',
        regex: 'regex',
        sub: 'sub'
    }
}