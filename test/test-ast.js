/*globals suite, test */

var Ast = require("infuse/ast"),
    FS  = require("fs"),
    should = require("should"),
    filepath = "./test/simple-sample.js"
;

suite("InfuseAst", function () {
    
    test("Setup", function () {
        Ast.NODE_TYPES.should.be.a("object");
        Ast.OPTIONS.BREAK.should.equal(1);
        Ast.OPTIONS.SKIP.should.equal(2);
    });
    
    test("Parser", function () {
        var content = FS.readFileSync(filepath, "utf8"),
            parser = new Ast({ file: filepath }),
            ast = parser.subject
        ;
        
        should.exist(ast);
        
        ast.should.have.property("type", "Program");
        ast.should.have.property("body");
        ast.should.have.property("range");
        ast.should.have.property("loc");
        ast.should.have.property("comments");
        ast.should.have.property("tokens");
        
        // [parser].join().should.equal(content);
    });
    
    test("traversal - in order", function () {
        var parser = new Ast({ file: filepath });
        
        parser.traverse({
            enter: function (node, parser) {
                console.log("Enter: " + node.type);
            }
        });
    });
    
    test("traversal - depth first", function () {
        var parser = new Ast({ file: filepath });
        
        parser.traverse({
            leave: function (node, parser) {
                // if (node.type === "CallExpression" && node.callee && node.callee.name === "require") {
                //     console.log(node);
                // }
                console.log("Leave: " + node.type);
            }
        });
    });
});