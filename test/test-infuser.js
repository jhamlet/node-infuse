/*globals suite, setup, test */

var Infuser = require('infuse/infuser'),
    Ast = require('infuse/ast'),
    FS  = require('fs'),
    source = 'var foo = \'foo\', baz = \'baz\', fn = require("fn"), bz = window.require("bz"); foo = foo + baz;',
    srcfile = 'test-infuse-source.js'
;

suite('Infuser', function () {
    
    setup(function () {
        FS.writeFileSync(srcfile, source, "utf8");
    });
    
    teardown(function () {
        FS.unlink(srcfile);
    });
    
    test('All Identifier nodes', function () {
        var infuser = new Infuser(),
            seen = 0
        ;
        
        infuser.use({
            'Identifier': function (node, infuser) {
                seen++;
                node.type.should.equal('Identifier');
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
            'Identifier[name="foo"]': function (node, infuser) {
                seen++;
                node.type.should.equal('Identifier');
                node.name.should.equal('foo');
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
            // this should fire both 'require' statements
            'CallExpression Identifier[name="require"]': function (node, infuser) {
                totalSeen++;
            },
            // this should only fire for the bare 'require'
            'call.callee > id[name = require]': function (node, infuser) {
                bareSeen++;
                node.parent.arguments[0].value.should.equal('fn');
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
            '.callee[name="require"]': function (node) {
                seen++;
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
            'lit[value="fn"]': function (node) {
                seen++;
            }
        });
        
        infuser.run(srcfile);
        
        seen.should.equal(1);
    });
});
