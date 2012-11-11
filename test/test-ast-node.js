/*globals suite, setup, test */

var nodeWrapper = require("infuse/ast/node"),
    Esprima = require("esprima"),
    should = require("should"),
    nutil   = require("util"),
    source = "var foo = 'foo';",
    ast
;

suite("AST - NodeWrapper", function () {
    
    setup(function () {
        ast = Esprima.parse(source);
        // console.log(JSON.stringify(ast, null, 4));
    });
    
    test("Basic wrapper functionality", function () {
        var node = nodeWrapper(ast);
        
        node.isWrapper.should.equal(true);
        node.update.should.be.a("function");
        
        node.childNodes.length.should.equal(1);
        node.childNodes[0].isWrapper.should.equal(true);

        node.toString().should.equal("var foo = \"foo\";");
    });
    
    test("Stringify sub-node", function () {
        var node = nodeWrapper(ast),
            child;
        
        // Grab the string literal token
        child = node.childNodes[0].childNodes[0].childNodes[1];
        // Prototype properties bubble...
        child.type.should.equal("Literal");
        // wrapper properties function
        child.isWrapper.should.equal(true);
        // child.hasOwnProperty("isWrapper").should.equal(true);
        // parent references work
        (child.parent.parent.parent === node).should.equal(true);

        // stringify
        child.toString().should.equal("\"foo\"");
    });
    
    test("Accessing child properties should propagate from subject", function () {
        var node = nodeWrapper(ast),
            child
        ;
        
        node.body = [{
            type: "ExpressionStatement",
            expression: { type: "Identifier", name: "foo" }
        }];
        
        node.toString().should.equal("foo;");

        child = node.body[0];

        node.childNodes[0].should.equal(child);
        
        child.isWrapper.should.equal(true);
        child.type.should.equal("ExpressionStatement");
        child.expression.type.should.equal("Identifier");
        child.expression.name.should.equal("foo");
    });
});
