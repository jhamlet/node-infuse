/*globals suite, setup, test */

var parse       = require("infuse/ast/parse"),
    stringify   = require("infuse/ast/stringify"),
    should      = require("should"),
    source      = "var foo = 'foo';",
    ast
;

suite("AST - stringify", function () {
    
    setup(function () {
        ast = parse(source);
    });
    
    test("Stringify", function () {
        stringify(ast).should.equal(source);
    });
});
