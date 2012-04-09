
var _ = require("underscore"),
    Iterator = require("../lib/iterator.js"),
    iter = new Iterator()
;

console.log(_.map([1, 2, 3], function (i) { return Math.pow(i, 2); }));

