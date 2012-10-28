/*globals suite, setup, test */

var Infuser = require("infuse/infuser"),
    Ast = require("infuse/ast"),
    source = "var foo = \"foo\", baz = \"baz\"; foo = foo + baz;"
;

suite("Infuser", function () {
    
    test("Find the Identifier nodes", function () {
        var ast = new Ast({
                source: source
            }),
            infuser = new Infuser(),
            seen = 0
        ;
        
        infuser.use({
            'Identifier': function (node, infuser) {
                seen++;
                node.type.should.equal("Identifier");
            }
        });
        
        infuser.run(ast);
        
        seen.should.equal(5);
    });
    
    test("Find named Identifier nodes", function () {
        var ast = new Ast({
                source: source
            }),
            infuser = new Infuser(),
            seen = 0
        ;
        
        infuser.use({
            '[type="Identifier"][name="foo"]': function (node, infuser) {
                seen++;
                node.type.should.equal("Identifier");
                node.name.should.equal("foo");
            }
        });
        
        infuser.run(ast);
        
        seen.should.equal(3);
    });
});
