/*globals suite, setup, test */

var Infuser = require("infuse/infuser"),
    Ast = require("infuse/ast"),
    source = "var foo = \"foo\", baz = \"baz\"; foo = foo + baz;"
;

suite("Infuser", function () {
    
    test("All Identifier nodes", function () {
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
    
    test("Identifier[name='foo']", function () {
        var ast = new Ast({
                source: source
            }),
            infuser = new Infuser(),
            seen = 0
        ;
        
        infuser.use({
            'Identifier[name="foo"]': function (node, infuser) {
                seen++;
                node.type.should.equal("Identifier");
                node.name.should.equal("foo");
            }
        });
        
        infuser.run(ast);
        
        seen.should.equal(3);
    });
    
    test("CallExpression > Identifier[name = require]", function () {
        var ast = new Ast({
                source: "var foo = require('foo'), baz = window.require('baz');"
            }),
            infuser = new Infuser(),
            bareSeen = 0,
            totalSeen = 0
        ;
        
        // console.log(JSON.stringify(ast, null, 4));
        
        infuser.use({
            // this should fire both 'require' statements
            "CallExpression Identifier[name='require']": function (node, infuser) {
                totalSeen++;
            },
            // this should only fire for the bare 'require'
            "call > id[name = require]": function (node, infuser) {
                bareSeen++;
                node.parent.arguments[0].value.should.equal("foo");
            }
        });
        
        infuser.run(ast);
        
        bareSeen.should.equal(1);
        totalSeen.should.equal(2);
    });
});
