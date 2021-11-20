const equal = require('fast-deep-equal');
const deepEqual = require('fast-deep-equal');

function _countIterable(iterable) {
    if (iterable.length) {
        return iterable.length;
    }

    if (iterable.size) {
        return iterable.size;
    }

    let count = 0;
    for (const _ in iterable) {
        count++;
    }

    return count;
}

function _isConstructorFunction(potentialConstructor) {
    return !!potentialConstructor.prototype && !!potentialConstructor.prototype.constructor.name;
}

function _isIterable(candidate) {
    return candidate[Symbol.iterator];
}

function _isSection(set, subset) {
    if (!subset.length) {
        return false;
    }

    for (let i = 0; i < set.length; i++) {
        if (i + subset.length > set.length) {
            return false;
        }

        const slice = set.slice(i, i + subset.length);
        if (equal(subset, slice)) {
            return true;
        }
    }

    return false;
}

function _isSubSet(set, subset) {
    for (const outer of subset) {
        let isInSet = false;
        for (const inner of set) {
            if (equal(outer, inner)) {
                isInSet = true;
                break;
            }
        }

        if (!isInSet) {
            return false;
        }
    }

    return true;
}

function _tryConvertToArray(candidate) {
    if (typeof candidate === 'string') {
        return candidate;
    }

    if (_isIterable(candidate) && !Array.isArray(candidate)) {
        return [...candidate]
    }

    return candidate;
}

function _tryGetPatternFromFactory(patternFactory, value) {
    if (typeof patternFactory === 'function') {
        return patternFactory(value);
    }

    return patternFactory;
}

function getReturnValue(returnValue) {
    if (typeof returnValue === 'function' && !_isConstructorFunction(returnValue)) {
        return returnValue();
    }

    return returnValue;
}

function equalOperation(value, pattern) {
    pattern = _tryGetPatternFromFactory(pattern, value);
    return deepEqual(value, pattern);
}

function isOperation(value, pattern) {
    pattern = _tryGetPatternFromFactory(pattern);

    //only when both value and pattern params are NaN.
    if (value !== value && pattern !== pattern) {
        return true;
    }

    return value === pattern;
}

function inOperation(value, iterable) {
    iterable = _tryGetPatternFromFactory(iterable, value);

    if (!_isIterable(iterable)) {
        throw new TypeError('Pattern is not iterable')
    }


    for (const item of iterable) {
        if (equal(value, item)) {
            return true;
        }
    }

    return false;
}

function regexOperation(value, pattern) {
    if (typeof value !== 'string') {
        throw new TypeError('The value must be a string');
    }

    pattern = _tryGetPatternFromFactory(pattern, value);

    const regex = new RegExp(pattern);
    return value.match(regex)?.length > 0;
}

function sectionOperation(section, collection) {
    collection = _tryGetPatternFromFactory(collection, section);

    if (typeof collection === 'string' && typeof section === 'string') {
        return collection.includes(section);
    }

    if (!_isIterable(collection)) {
        throw new TypeError('Pattern is not iterable');
    }

    if (_isIterable(section) && !Array.isArray(section)) {
        section = _tryConvertToArray(section);
    }

    if (Array.isArray(section)) {
        collection = _tryConvertToArray(collection);
        const diff = collection.length - section.length;

        return diff < 0 ? false : _isSection(collection, section);
    }

    return inOperation(section, collection);
}

function subOperation(subset, set) {
    set = _tryGetPatternFromFactory(set, subset);

    if (!_isIterable(set)) {
        throw new TypeError('Pattern is not iterable');
    }

    if (_isIterable(subset)) {
        if (_countIterable(subset) > _countIterable(set)) {
            return false;
        }

        return _isSubSet(set, subset);
    }

    return inOperation(subset, set);
}

const operations = {
    equal: 'equal',
    in: 'in',
    is: 'is',
    section: 'section',
    sub: 'sub',
    regex: 'regex'
}

module.exports = Object.freeze({
    operations,
    getReturnValue,
    eqaul: equalOperation,
    in: inOperation,
    is: isOperation,
    section: sectionOperation,
    sub: subOperation,
    regex: regexOperation
});
