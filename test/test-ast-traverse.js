/*globals suite, setup, test */

var Esprima = require("esprima"),
    traverse = require("infuse/ast/traverse"),
    should = require("should"),
    nutil   = require("util"),
    source = "var foo = 'foo';",
    inOrder = ["Program", "VariableDeclaration", "VariableDeclarator", "Identifier", "Literal"],
    postOrder = ["Identifier", "Literal", "VariableDeclarator", "VariableDeclaration", "Program"],
    ast
;

suite("AST - traverse", function () {
    
    setup(function () {
        ast = Esprima.parse(source);
        // console.log(JSON.stringify(ast, null, 4));
    });
    
    test("Correct in-order traversal", function () {
        var count = 0;
        
        traverse(ast, {
            enter: function (node) {
                node.type.should.equal(inOrder[count]);
                count++;
            }
        });
    });
    
    test("Correct post-order traversal", function () {
        var count = 0;
        
        traverse(ast, {
            leave: function (node) {
                node.type.should.equal(postOrder[count]);
                count++;
            }
        });
    });
});