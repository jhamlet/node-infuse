
var rx       = require("rx"),
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
