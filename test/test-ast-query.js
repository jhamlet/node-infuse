/*globals suite, test */

var Query = require("infuse/ast/query"),
    Ast = require("infuse/ast"),
    selector
;

suite("AST - Query", function () {
    
    setup(function () {
        selector = new Query("Identifier");
    });
    
    test("Matching type is true", function () {
        var ast = new Ast({ source: "var foo = 'foo';" }),
            node = ast.subject.getChildNodes()[0].getChildNodes()[0].id
        ;
        selector.test(node).should.equal(true);
    });

    test("Non-matching type is false", function () {
        var ast = new Ast({ source: "require('foo');" }),
            node = ast.subject.getChildNodes()[0].getChildNodes()[0]
        ;
        selector.test(node).should.equal(false);
    });
});