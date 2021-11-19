const match = require('./match');
const { MatchBuilder } = match;

let result = match(true)
.equal((val) => {
    console.log(val);
    return 5 + 2 === 7
}, () => 'right')
.end()

console.log(result);

let matcher = new MatchBuilder({ multiMatch: true, zeroBased: true })
.in([8 - 1, 220, -1], () => 'great')
.equal(() => 7, 'success')
.construct()

console.log(matcher.match(7));