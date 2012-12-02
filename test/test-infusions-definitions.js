/*globals suite, setup, test */

var Infuser         = require('infuse/infuser'),
    Ast             = require('infuse/ast'),
    DefinesInfusion = require('infuse/infusions/definitions'),
    srcfile         = 'test-src/infusions-definitions.js'
;

suite('Infusion - Definitions', function () {
    
    test('Simple replacement', function () {
        var infuser = new Infuser(),
            ast
        ;
        
        infuser.use(new DefinesInfusion({
            INFUSE_FOO: 'foo'
        }));
        
        ast = infuser.run(new Ast({file: srcfile}));
        
        ast.subject.body[0].declarations[0].id.name.should.equal('foo');
        ast.subject.body[0].declarations[0].init.value.should.equal('foo');
    });
    
    test('Array replacement', function () {
        var infuser = new Infuser(),
            obj = {
                INFUSE_FOO: [1, 2, 3, 4]
            },
            ast
        ;
        
        infuser.use(new DefinesInfusion(obj));
        
        ast = infuser.run(new Ast({file: srcfile}));
        
        ast.subject.body[0].declarations[0].id.name.should.equal('foo');
        ast.subject.body[0].declarations[0].init.type.should.equal('ArrayExpression');
        
        ast.subject.body[0].declarations[0].init.elements.forEach(function (node, idx) {
            node.type.should.equal('Literal');
            node.value.should.equal(obj.INFUSE_FOO[idx]);
        });
    });
    
    test('Function replacement', function () {
        var infuser = new Infuser(),
            obj = {
                INFUSE_FOO: function () {
                    return 'foo';
                }
            },
            ast
        ;
        
        infuser.use(new DefinesInfusion(obj));
        
        ast = infuser.run(new Ast({file: srcfile}));
        
        ast.subject.body[0].declarations[0].id.name.should.equal('foo');
        ast.subject.body[0].declarations[0].init.type.should.equal('FunctionExpression');
    });

    test('Call function replacement', function () {
        var infuser = new Infuser(),
            obj = {
                INFUSE_BAZ: function () {
                    return 'baz';
                }
            },
            ast
        ;
        
        infuser.use(new DefinesInfusion(obj));
        
        ast = infuser.run(new Ast({file: srcfile}));
        
        ast.subject.body[0].declarations[1].id.name.should.equal('baz');
        ast.subject.body[0].declarations[1].init.type.should.equal('Literal');
        ast.subject.body[0].declarations[1].init.value.should.equal('baz');
    });
    
    test('Call function replacement with nested definitions', function () {
        var infuser = new Infuser(),
            obj = {
                INFUSE_FOO: 'foo',
                INFUSE_BAR: function (name) {
                    return name + '-bar';
                }
            },
            ast
        ;
        
        infuser.use(new DefinesInfusion(obj));
        
        ast = infuser.run(new Ast({file: srcfile}));
        
        ast.subject.body[0].declarations[2].id.name.should.equal('bar');
        ast.subject.body[0].declarations[2].init.type.should.equal('Literal');
        ast.subject.body[0].declarations[2].init.value.should.equal('foo-bar');
    });
    
    test('Call function replacement that isn\'t defined as a function throws an Error', function () {
        var infuser = new Infuser(),
            obj = {
                INFUSE_FOO: 'foo',
                INFUSE_BAR: 'bar'
            },
            ast
        ;
        
        infuser.use(new DefinesInfusion(obj));
        
        (function () {
            ast = infuser.run(new Ast({file: srcfile}));
        }).should.throw();
    });
    
    test('Call Function with nested Call Function with nested definitions', function () {
        var infuser = new Infuser(),
            obj = {
                INFUSE_FOO: 'foo',
                INFUSE_BAZ: function (name) {
                    return (name || 'baz') + '-baz';
                },
                INFUSE_BAR: function (name) {
                    return name + '-bar';
                }
            },
            ast
        ;
        
        infuser.use(new DefinesInfusion(obj));
        
        ast = infuser.run(new Ast({file: srcfile}));
        
        ast.subject.body[0].declarations[3].id.name.should.equal('barBaz');
        ast.subject.body[0].declarations[3].init.type.should.equal('Literal');
        ast.subject.body[0].declarations[3].init.value.should.equal('foo-baz-bar');
        
        // console.log(ast.source);
    })
});
