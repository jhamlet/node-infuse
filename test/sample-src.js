
var _ = require("underscore"),
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

console.log(_.map([1, 2, 3], function (i) { return Math.pow(i, 2); }));

MyClass = function () {
    
}

MyClass.prototype = {
    env: MAKE_SPECIAL_METHOD(ENVIRONMENT),
            buildOs: EXEC(function () {
                return require("os").hostname;
            })
};

var obj = new MyClass();
console.log(obj.env());
