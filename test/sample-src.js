
var // rx       = require("rx"),
    //_        = require("underscore"),
    Iterator = require("../lib/iterator.js"),
    iter     = new Iterator(),
    title    = STRINGS(TITLE_KEY),
    subtitle = STRINGS("UI.STRING.SUB-TITLE"),
    nothing  = STRINGS(),
    MyClass
;

if (ENVIRONMENT === "dev") {
    console.log("Development environment");
}

// console.log(_.map([1, 2, 3, 4], function (i) { return Math.pow(i, 2); }));
console.log([1, 2, 3, 4].map(function (i) { return Math.pow(i, 2); }));

MyClass = function () {
    
}

MyClass.prototype = {
    foo: function () {
        return "Foo";
    },
    env: MAKE_SPECIAL_METHOD(ENVIRONMENT),
    buildOs: EXEC(function () {
        return typeof os !== "undefined" ? os.hostname : false;
    })
};

var obj = new MyClass();
console.log(obj.env());
