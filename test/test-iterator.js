/*globals suite, test, setup, teardown */

var should  = require("should"),
    SysUtil = require("util"),
    uglylib = require("uglify-js"),
    jsp     = uglylib.parser,
    Iterator = require("../lib/iterator").DFIterator
;

suite("Iterator", function () {
    var code = [
            "(function (exports) {",
                "// My function...",
                "var a = 1,b = 2,c = 3;",
                "exports.fn = function () {",
                    "return a + b + c;",
                "};",
            "}(module.exports));"
        ].join("\n"),
        ast = jsp.parse(code, true, false),
        iterator
    ;
    
    // console.log(SysUtil.inspect(ast, false, 100));
    
    setup(function () {
        iterator = new Iterator(ast);
    });
    
    test("#next, #skipTo", function () {
        iterator.start();
        iterator.getCurrent()[0].should.equal("toplevel");
        iterator.next().next().next();
        iterator.getCurrent()[0].should.equal("call");
        iterator.skipTo("assign");
        should.exist(iterator.getCurrent());
        iterator.getCurrent()[1].should.equal(true);
    });
    
    test("#skipTo, #rewindTo", function () {
        iterator.start();
        iterator.skipTo("stat").skipTo("stat");
        iterator.getCurrent()[0].should.equal("stat");
        iterator.rewindTo("var");
        iterator.getCurrent()[0].should.equal("var");
    });
});