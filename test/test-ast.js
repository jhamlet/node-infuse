/*globals suite, test */

var Ast = require("infuse/ast"),
    FS  = require("fs"),
    should = require("should"),
    source  = "var foo = \"foo\";",
    filepath = "test/test-ast-sample.js",
    ast
;

suite("InfuseAst", function () {
    
    setup(function () {
        ast = new Ast(source);
        FS.writeFileSync(filepath, "var baz = \"baz\";", "utf8");
    });
    
    teardown(function () {
        FS.unlinkSync(filepath);
    });
    
    test("Static properties exist", function () {
        Ast.NODE_TYPES.should.be.a("object");
        Ast.NODE_CHILD_KEYS.should.be.a("object");
        Ast.TRAVERSAL_OPTIONS.BREAK.should.equal(1);
        Ast.TRAVERSAL_OPTIONS.SKIP.should.equal(2);
    });
    
    test("Subject parsed correctly", function () {
        ast.subject.should.be.a("object");
        ast.subject.isWrapper.should.equal(true);
        ast.subject.body[0].type.should.equal("VariableDeclaration");
        ast.parsed.should.equal(true);
        ast.generated.should.equal(false);
    });
    
    test("Source correctly computed", function () {
        ast.subject.should.be.a("object");
        ast.parsed.should.equal(true);
        ast.generated.should.equal(false);
        ast.source.should.equal(source);
        ast.generated.should.equal(true);
    });
    
    test("Source from file", function () {
        var ast = new Ast({ file: filepath });
        ast.subject.should.be.a("object");
        ast.subject.isWrapper.should.equal(true);
        ast.subject.body[0].type.should.equal("VariableDeclaration");
        ast.parsed.should.equal(true);
        ast.generated.should.equal(false);
        ast.source.should.equal(FS.readFileSync(filepath, "utf8"));
        ast.generated.should.equal(true);
    });

    test("Setting file property resets source", function () {
        ast.source.should.equal(source);
        ast.file = filepath;
        should.not.exist(ast.options.source);
        ast.source.should.not.equal(source);
        ast.source.should.equal(FS.readFileSync(filepath, "utf8"));
        ast.generated.should.equal(true);
    });
});