/*globals suite, setup, test */

var Infuser  = require('infuse/infuser'),
    Requires = require('infuse/infusions/requires')
;

suite('Infuser - Requires', function () {
    
    test('One Require', function () {
        var infuser = new Infuser();
        infuser.use(new Requires());
        infuser.run('test-src/infusions-requires.js');
    });
});