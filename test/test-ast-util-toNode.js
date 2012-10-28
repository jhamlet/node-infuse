/*globals suite, test */

var should = require("should"),
    nutil   = require("util"),
    astUtil = require("infuse/ast/util")
;

suite("AST - util.toNode", function () {
    
    test("Literal to Node", function () {
        // boolean
        astUtil.toNode(true).should.eql({
            type: "Literal",
            value: true
        });
        // number
        astUtil.toNode(5).should.eql({
            type: "Literal",
            value: 5
        });
        // string
        astUtil.toNode("abc").should.eql({
            type: "Literal",
            value: "abc"
        });
    });
    
    test("Identifier to Node", function () {
        astUtil.toNode(undefined).should.eql({
            type: "Identifier",
            name: "undefined"
        });
    });
    
    test("Object to Node", function () {
        var obj = { foo: "foo" },
            ast = astUtil.toNode(obj)
        ;
        
        ast.type.should.equal("ObjectExpression");
        ast.properties.should.eql([
            {
                type: "Property",
                key: {
                    type: "Identifier",
                    name: "foo"
                },
                value: {
                    type: "Literal",
                    value: "foo"
                },
                kind: "init"
            }
        ]);
    });
    
    test("Array to Node", function () {
        var list = [1, 2, 3],
            ast = astUtil.toNode(list)
        ;
        
        ast.type.should.equal("ArrayExpression");
        ast.elements.should.eql([
            {
                type: "Literal",
                value: 1
            },
            {
                type: "Literal",
                value: 2
            },
            {
                type: "Literal",
                value: 3
            }
        ]);
    });
    
    test("Array of Objects to Node", function () {
        var list = [
                {
                    foo: "foo1"
                },
                {
                    foo: "foo2"
                },
                {
                    foo: "foo3"
                }
            ],
            ast = astUtil.toNode(list)
        ;
        
        ast.type.should.equal("ArrayExpression");
        ast.elements.length.should.equal(3);

        ast.elements[0].type.should.equal("ObjectExpression");
        ast.elements[0].properties[0].type.should.equal("Property");
        ast.elements[0].properties[0].key.should.eql({
            type: "Identifier",
            name: "foo"
        });
        ast.elements[0].properties[0].value.should.eql({
            type: "Literal",
            value: "foo1"
        });
        ast.elements[0].properties[0].kind.should.equal("init");

        ast.elements[1].type.should.equal("ObjectExpression");
        ast.elements[1].properties[0].type.should.equal("Property");
        ast.elements[1].properties[0].key.should.eql({
            type: "Identifier",
            name: "foo"
        });
        ast.elements[1].properties[0].value.should.eql({
            type: "Literal",
            value: "foo2"
        });
        ast.elements[1].properties[0].kind.should.equal("init");
        
        ast.elements[2].type.should.equal("ObjectExpression");
        ast.elements[2].properties[0].type.should.equal("Property");
        ast.elements[2].properties[0].key.should.eql({
            type: "Identifier",
            name: "foo"
        });
        ast.elements[2].properties[0].value.should.eql({
            type: "Literal",
            value: "foo3"
        });
        ast.elements[2].properties[0].kind.should.equal("init");
    });
    
    test("Function to Node", function () {
        var ast = astUtil.toNode(function foo () { return 'foo'; });

        ast.type.should.equal("FunctionExpression");
        ast.id.should.equal("foo");
        ast.params.should.eql([]);
        ast.body.type.should.equal("BlockStatement");
        ast.body.body[0].type.should.equal("ReturnStatement");
        ast.body.body[0].argument.type.should.equal("Literal");
        ast.body.body[0].argument.value.should.equal("foo");
        
    });

});