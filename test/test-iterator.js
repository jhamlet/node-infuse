/*globals suite, test, setup, teardown */

var should  = require("should"),
    SysUtil = require("util"),
    uglylib = require("uglify-js"),
    jsp     = uglylib.parser,
    Iterator = require("../lib/iterator")
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
        iter
    ;
    
    // console.log(SysUtil.inspect(ast, false, 100));
    
    setup(function () {
        iter = new Iterator(ast);
    });
    
    test("#next, #skipTo", function () {
        iter.getCurrent().name.should.equal("toplevel");
        iter.next().next().next();
        iter.getCurrent().name.should.equal("call");
        iter.skipTo("assign");
        should.exist(iter.getCurrent());
        iter.getCurrent()[1].should.equal(true);
    });
    
    test("#skipTo, #rewindTo", function () {
        iter.skipTo("stat").skipTo("stat");
        iter.getCurrent().name.should.equal("stat");
        iter.rewindTo("var");
        iter.getCurrent().name.should.equal("var");
    });
    
    test("Iterator.contains", function () {
        var parent, child;
        
        iter.skipTo("var");
        parent = iter.getCurrent();
        
        iter.skipTo("b");
        child = iter.getCurrent();
        
        Iterator.contains(parent, child).should.equal(true);
        
        iter.skipTo("assign");
        child = iter.getCurrent();

        Iterator.contains(parent, child).should.equal(false);
    });
    
    test("#getParent", function () {
        iter.skipTo("b");
        iter.getCurrent().name.should.equal("b");
        
        iter.getParent(iter.getCurrent()).name.should.equal("var");
    });
    
    test("#findAllNames", function () {
        var named = iter.findAllNames("b");
        console.log(named);
    });
});