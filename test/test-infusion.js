/*globals suite, setup, test */

var Infusion = require('infuse/infusion');

suite('Infusion', function () {
    
    test('Rules and events are prototype linked', function () {
        var Vanilla, Chamomile, infusion;
        // Setup
        Vanilla = Infusion.derive({
            rules: {
                'Rule A': function () {
                    return 'a';
                },
                'Rule C': function () {
                    return 'c';
                }
            },
            events: {
                'Event A': function () {
                    return 'a';
                },
                'Event C': function () {
                    return 'c';
                }
            }
        });
        
        Chamomile = Vanilla.derive({
            rules: {
                'Rule B': function () {
                    return 'b';
                },
                'Rule C': function () {
                    return 'C';
                }
            },
            events: {
                'Event B': function () {
                    return 'b';
                },
                'Event C': function () {
                    return 'C';
                }
            }
        });
        
        infusion = new Chamomile();
        // test
        infusion.should.have.ownProperty('rules');
        infusion.should.have.ownProperty('events');
        infusion.rules['Rule A']().should.equal('a');
        infusion.rules['Rule B']().should.equal('b');
        infusion.rules['Rule C']().should.not.equal('c');
        infusion.rules['Rule C']().should.equal('C');
        infusion.events['Event A']().should.equal('a');
        infusion.events['Event B']().should.equal('b');
        infusion.events['Event C']().should.not.equal('c');
        infusion.events['Event C']().should.equal('C');
    });
    
});