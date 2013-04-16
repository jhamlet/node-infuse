/*globals suite, setup, test */

var Infuser  = require('infuse/infuser'),
    Requires = require('infuse/infusions/requires'),
    Ast      = require('infuse/ast')
;

suite('Infusions - Requires', function () {
    
    test('resolve', function () {
        var infuser = new Infuser();
        infuser.use(new Requires({
            resolve: require('infuse/resolve')
        }));
        infuser.run(new Ast({ file: 'test-src/infusions-requires.js'}));
    });
    
    test('resolveIt', function () {
        var infuser = new Infuser();
        infuser.use(new Requires({
            resolve: function (name, startDir) {
                return require('resolveit').sync(name, startDir);
            }
        }));
        infuser.run(new Ast({ file: 'test-src/infusions-requires.js'}));
    });
    
    test('no resolve function throws an error', function () {
        var infusion;
        
        (function () {
            infusion = new Requires();
        }).should.throw()
    });
});