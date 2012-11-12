/*globals suite, setup, test */

var Infuser = require('infuse/infuser'),
    Ast = require('infuse/ast'),
    FS  = require('fs'),
    source = '',
    srcfile = 'test-src/infuser.js'
;

suite('Infuser', function () {
    
    suite('Events', function () {
        
        ['start', 'complete'].forEach(function (name) {
            test(name, function () {
                var
                    infuser = new Infuser(),
                    events = {},
                    fired = 0
                ;
                
                events[name] = function (inf) {
                    inf.should.equal(infuser);
                    fired++;
                };
                
                infuser.use({ events: events });
                infuser.run(srcfile);
                
                fired.should.be.above(0);
            });
        });
        
        ['enter', 'leave', 'visit', '*'].forEach(function (name) {
            test(name, function () {
                var
                    infuser = new Infuser(),
                    events = {},
                    fired = 0
                ;
                
                events[name] = function (arg1, arg2) {
                    infuser.should.equal(arg2);
                    fired++;
                };
                
                infuser.use({ events: events });
                infuser.run(srcfile);
                
                // console.log(fired);
                fired.should.be.above(25);
            });
        });
    });
    
    suite('Rules', function () {
        test('All Identifier nodes', function () {
            var infuser = new Infuser(),
                seen = 0
            ;

            infuser.use({
                rules: {
                    'Identifier': function (node, infuser) {
                        seen++;
                        node.type.should.equal('Identifier');
                    }
                }
            });

            infuser.run(srcfile);

            seen.should.equal(10);
        });

        test('Identifier[name="foo"]', function () {
            var infuser = new Infuser(),
                seen = 0
            ;

            infuser.use({
                rules: {
                    'Identifier[name="foo"]': function (node, infuser) {
                        seen++;
                        node.type.should.equal('Identifier');
                        node.name.should.equal('foo');
                    }
                }
            });

            infuser.run(srcfile);

            seen.should.equal(3);
        });

        test('CallExpression > Identifier[name = require]', function () {
            var infuser = new Infuser(),
                bareSeen = 0,
                totalSeen = 0
            ;

            // console.log(JSON.stringify(ast, null, 4));

            infuser.use({
                rules: {
                    // this should fire both 'require' statements
                    'CallExpression Identifier[name="require"]': function (node, infuser) {
                        totalSeen++;
                    },
                    // this should only fire for the bare 'require'
                    'call.callee > id[name = require]': function (node, infuser) {
                        bareSeen++;
                        node.parent.arguments[0].value.should.equal('fn');
                    }
                }
            });

            infuser.run(srcfile);

            bareSeen.should.equal(1);
            totalSeen.should.equal(2);
        });

        test('.callee[name="require"]', function () {
            var infuser = new Infuser(),
                seen = 0
            ;

            infuser.use({
                rules: {
                    '.callee[name="require"]': function (node) {
                        seen++;
                    }
                }
            });

            infuser.run(srcfile);

            seen.should.equal(1);
        });

        test('lit[value="fn"]', function () {
            var infuser = new Infuser(),
                seen = 0
            ;

            infuser.use({
                rules: {
                    'lit[value="fn"]': function (node) {
                        seen++;
                    }
                }
            });

            infuser.run(srcfile);

            seen.should.equal(1);
        });
    });
    
    suite('Sub Files', function () {
        var infuser = new Infuser(),
            fired = { begin: false, end: false, node: false },
            subfile = 'test-src/infuser-a.js'
        ;
        
        infuser.use({
            events: {
                'begin': function (infuser) {
                    fired.begin = true;
                    infuser.file.should.equal(subfile);
                },
                'end': function (infuser) {
                    fired.end = true;
                    infuser.file.should.equal(subfile);
                },
                'start': function (infuser) {
                    infuser.file.should.equal(srcfile);
                    infuser.run(subfile);
                    infuser.file.should.equal(srcfile);
                },
                'complete': function (infuser) {
                    infuser.file.should.equal(srcfile);
                }
            },
            rules: {
                'fun.id > id[name=fooBar]': function (node, infuser) {
                    fired.node = true;
                    infuser.file.should.equal(subfile);
                }
            }
        });
        
        test('begin and end events', function () {
            fired.begin.should.equal(true, 'begin was not fired');
            fired.end.should.equal(true, 'end was not fired');
        });
        
        test('"fun.id > id[name=fooBar]" found', function () {
            fired.node.should.equal(true, 'did not find the CallExpression');
        });
        
        infuser.run(srcfile);
    });
    
    test('Modified nodes are re-traversed', function () {
        var 
            infuser = new Infuser(),
            ast
        ;
        
        infuser.use({
            rules: {
                'id[name=FOO]': function (node, infuser) {
                    node.update({
                        type: 'Literal',
                        value: 'foo'
                    });
                },
                'id[name=BAZ]': function (node, infuser) {
                    node.update({
                        type: 'Identifier',
                        name: 'FOO'
                    });
                }
            }
        });
        
        ast = infuser.run('test-src/infuser-b.js');
        
        ast.source.should.equal('var fooBaz = "foo";');
    });
});
