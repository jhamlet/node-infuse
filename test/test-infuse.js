/*globals suite, test, setup, teardown */

var should  = require("should"),
    SysUtil = require("util"),
    uglylib = require("uglify-js"),
    jsp     = uglylib.parser,
    Iterator = require("../lib/iterator")
;

suite("Infuse", function () {
    var code = [
            "(function (exports) {",
                "// My function...",
                "var a = require(\"./some/file/path.js\"),b = 2,c = 3,",
                    "d = process.env.ENVIRONMENT === \"debug\" ? true : false",
                ";",
                "infuse.if(process.env.ENVIRONMENT === \"debug\", function () {",
                    "exports.fn = function () {",
                        "return b + c;",
                    "};",
                "}, infuse.if(process.env.ENVIRONMENT === \"staging\", function () {",
                    "exports.fn = function () {",
                        "return b / c;",
                    "};",
                "}, function () {",
                    "exports.fn = function () {",
                        "return b * c;",
                    "};",
                "}));",
                "if (process.env.ENVIRONMENT === \"debug\") {",
                    "exports.fn = function () {",
                        "return b + c;",
                    "};",
                "}",
                "else if (process.env.ENVIRONMENT === \"staging\") {",
                    "exports.fn = function () {",
                        "return b / c;",
                    "};",
                "}",
                "else {",
                    "exports.fn = function () {",
                        "return b * c;",
                    "};",
                "}",
            "}(module.exports));"
        ].join("\n"),
        ast = jsp.parse(code, true, false),
        iterator
    ;
    
    console.log(SysUtil.inspect(ast, false, 100));
    
    setup(function () {
        iterator = new Iterator(ast);
    });
    
    test("#one", function () {
        iterator.skipTo("if").skipTo("dot").skipTo("name");
        iterator.getCurrent().name.should.equal("name");
        iterator.getCurrent()[1].should.equal("process");
    });
    
    // ["if", ["dot", ["name", "process"] ] ]
    
});