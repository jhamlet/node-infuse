/*globals suite, test */

var Ast = require('infuse/ast'),
    FS  = require('fs'),
    should = require('should'),
    source  = 'var foo = \'foo\';',
    filepath = 'test-src/ast.js',
    ast
;

suite('AST', function () {
    
    setup(function () {
        ast = new Ast(source);
    });
    
    test('Static properties exist', function () {
        Ast.TRAVERSAL_OPTIONS.BREAK.should.equal(1);
        Ast.TRAVERSAL_OPTIONS.SKIP.should.equal(2);
        Ast.TRAVERSAL_OPTIONS.REVISIT.should.equal(3);
    });
    
    test('Subject parsed correctly', function () {
        ast.subject.should.be.a('object');
        ast.subject.body[0].type.should.equal('VariableDeclaration');
        ast.parsed.should.equal(true);
        ast.generated.should.equal(false);
    });
    
    test('Source correctly computed', function () {
        ast.subject.should.be.a('object');
        ast.parsed.should.equal(true);
        ast.generated.should.equal(false);
        ast.source.should.equal(source);
        ast.generated.should.equal(true);
    });
    
    test('Source from file', function () {
        var ast = new Ast({ file: filepath });
        ast.subject.should.be.a('object');
        ast.subject.body[0].type.should.equal('VariableDeclaration');
        ast.parsed.should.equal(true);
        ast.generated.should.equal(false);
        ast.source.should.equal(FS.readFileSync(filepath, 'utf8'));
        ast.generated.should.equal(true);
    });

    test('Setting file property resets source', function () {
        ast.source.should.equal(source);
        ast.file = filepath;
        should.not.exist(ast.options.source);
        ast.source.should.not.equal(source);
        ast.source.should.equal(FS.readFileSync(filepath, 'utf8'));
        ast.generated.should.equal(true);
    });
    
    test('Simple Query', function () {
        var nodes = ast.query('Identifier[name="foo"]');
        
        nodes.length.should.equal(1);
        nodes[0].type.should.equal('Identifier');
        nodes[0].name.should.equal('foo');
        
        nodes = ast.query('lit[value="foo"]');
        nodes.length.should.equal(1);
        nodes[0].type.should.equal('Literal');
        nodes[0].value.should.equal('foo');
    });
});