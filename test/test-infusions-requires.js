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
    
});