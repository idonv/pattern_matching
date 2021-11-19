const MatchBuilder = require('./builder');

module.exports = function match(value, options) {
    const builder = new MatchBuilder(options);
    return {
        get not() {
            builder.not;
            return this;
        },

        default(defaultValue) {
            builder.default(defaultValue);
            return { end: this.end };
        },

        in(pattern, returnValue) {
            builder.in(pattern, returnValue);
            return this;
        },

        is(pattern, returnValue) {
            builder.is(pattern, returnValue);
            return this;
        },

        equal(pattern, returnValue) {
            builder.equal(pattern, returnValue);
            return this;
        },

        regex(pattern, returnValue) {
            return builder.case(pattern, returnValue, 'regex');
        },

        case(pattern, returnValue, op) {
            builder.case(pattern, returnValue, op);
            return this;
        },

        end() {
            return builder.construct().match(value);
        }
    }
}