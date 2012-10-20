/*globals suite, setup, test */

var nodeWrapper = require("infuse/ast/node-wrapper"),
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
        node.inspect.should.be.a("function");
        
        node.childKeys.length.should.above(0);
        node.childKeys.should.include("body");
        
        node.childNodes.length.should.equal(1);
        node.childNodes[0].isWrapper.should.equal(true);

        should.not.exist(node.subject.isWrapper);

        // node.valueOf().should.equal(node);
        node.toString().should.equal("var foo = \"foo\";");
    });
    
    test("Accessing subject propagates own properties to subject", function () {
        var node = nodeWrapper(ast),
            subject
        ;
        
        node.foo = "foo";
        node.hasOwnProperty("foo").should.equal(true);

        subject = node.subject;
        subject.foo.should.equal("foo");
        node.hasOwnProperty("foo").should.equal(false);
    });
    
    test("Stringify sub-node", function () {
        var node = nodeWrapper(ast),
            child;
        
        // Grab the string literal token
        child = node.childNodes[0].childNodes[0].childNodes[1];
        // Prototype properties bubble...
        child.type.should.equal("Literal");
        // node properties are not defined on the wrapper
        child.hasOwnProperty("type").should.equal(false);
        // wrapper properties function
        child.isWrapper.should.equal(true);
        child.hasOwnProperty("isWrapper").should.equal(true);
        // parent references work
        (child.parent.parent.parent === node).should.equal(true);
        // The following doesn't work -- should is doing something with the inspect function
        // child.parent.should.eql(node.valueOf());

        // stringify
        child.toString().should.equal("\"foo\"");
    });
});
