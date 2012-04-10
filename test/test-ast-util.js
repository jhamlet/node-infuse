/*globals suite, test, setup, teardown */

var should  = require("should"),
    SysUtil = require("util"),
    astUtil = require("../lib/ast-util"),
    Iterator = require("../lib/iterator")
;

suite("AST Utils", function () {
    
    test("Array to AST", function () {
        var list = [
                "a",
                1,
                {
                    foo: "foo"
                }
            ],
            ast = astUtil.valueToAst(list),
            iter = new Iterator(ast)
        ;
        
        // console.log(SysUtil.inspect(ast, false, 100));

        iter.getCurrent().name.should.equal("array");
        iter.next();
        iter.getCurrent()[1].should.be.an.instanceof(Array);
        iter.next();
        iter.getCurrent().name.should.equal("string");
        iter.getCurrent()[1].should.equal("a");
        
        iter.skipTo("num");
        iter.getCurrent()[1].should.equal(1);
        
        iter.skipTo("object");
        iter.getCurrent()[1].should.be.an.instanceof(Array);
        iter.next().next();
        iter.getCurrent().name.should.equal("foo");
        iter.next();
        iter.getCurrent().name.should.equal("string");
        iter.getCurrent()[1].should.equal("foo");
        
    });
    
    test("Object to AST", function () {
        var obj = {
                list: ["A", 2, "c", 4],
                foo: function () {
                    return "foo";
                }
            },
            ast = astUtil.valueToAst(obj),
            iter = new Iterator(ast)
        ;
        
        // console.log(SysUtil.inspect(ast, false, 100));
    });
    
});
