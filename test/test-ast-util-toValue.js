/*globals suite, test */

var should = require("should"),
    nutil   = require("util"),
    astUtil = require("infuse/ast/util")
;

suite("AST - util.toValue", function () {
    
    test("Node Literal to Value", function () {
        astUtil.toValue({
            type: "Literal",
            value: true
        }).should.equal(true);
        
        astUtil.toValue({
            type: "Literal",
            value: 2
        }).should.equal(2);
        
        astUtil.toValue({
            type: "Literal",
            value: "abc"
        }).should.equal("abc");
    });
    
    test("Node ObjectExpression to Value", function () {
        astUtil.toValue({
            type: "ObjectExpression",
            properties: [
                {
                    type: "Property",
                    key: {
                        type: "Identifier",
                        name: "foo1"
                    },
                    value: {
                        type: "Literal",
                        value: "foo1"
                    },
                    kind: "init"
                },
                {
                    type: "Property",
                    key: {
                        type: "Identifier",
                        name: "foo2"
                    },
                    value: {
                        type: "Literal",
                        value: "foo2"
                    },
                    kind: "init"
                },
                {
                    type: "Property",
                    key: {
                        type: "Identifier",
                        name: "foo3"
                    },
                    value: {
                        type: "Literal",
                        value: "foo3"
                    },
                    kind: "init"
                }
            ]
        }).should.eql({
            foo1: "foo1",
            foo2: "foo2",
            foo3: "foo3"
        });
    });
    
    test("Node FunctionExpression to Value", function () {
        var fn = astUtil.toValue({
                type: "FunctionExpression",
                params: [
                    {
                        type: "Identifier",
                        name: "foo"
                    }
                ],
                body: {
                    type: "BlockStatement",
                    body: [
                        {
                            type: "ReturnStatement",
                            argument: {
                                type: "Identifier",
                                name: "foo"
                            }
                        }
                    ]
                }
            })
        ;
        
        (typeof fn).should.equal("function");
        fn("foo").should.equal("foo");
    });
});