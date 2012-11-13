/*globals suite, setup, test */

var parse   = require("infuse/ast/parse"),
    should  = require("should"),
    FS      = require("fs"),
    source  = "var foo = \"foo\";",
    filepath = "test/ast-parse-sample.js"
;

suite("AST - parse", function () {
    
    setup(function () {
        FS.writeFileSync(filepath, source, "utf8");
    });
    
    teardown(function () {
        FS.unlinkSync(filepath);
    });
    
    test("String argument", function () {
        parse(source);
    });
    
    test("Source option", function () {
        parse({ source: source });
    });
    
    test("File option", function () {
        parse({ file: filepath });
    });
    
    test("Source option preempts file option", function () {
        var opts = {},
            propertyAccessed
        ;
        
        parse(Object.defineProperties(opts, {
            source: { get: function () {
                propertyAccessed = "source";
                return source;
            }, enumerable: true },
            file: { get: function () {
                propertyAccessed = "file";
                return filepath;
            }, enumerable: true }
        }));
        
        propertyAccessed.should.equal("source");
    });
    
    test("Source argument preempts options", function () {
        var ast = parse("var baz = \"baz\";", { source: source, file: filepath }),
            token = ast.body[0].declarations[0].id
        ;
        
        token.type.should.equal("Identifier");
        token.name.should.equal("baz");
    });
    
    test("Missing source argument, or source and file options, should throw an Error", function () {
        var ast;
        
        (function () {
            ast = parse();
        }).should.throw();
    });
    
});