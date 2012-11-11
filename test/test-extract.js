/*globals suite, setup, test */

var Extract = require('infuse/extract');

suite('Extract', function () {
    
    test('Rules and events are prototype linked', function () {
        var Vanilla, Chamomile, extract;
        // Setup
        Vanilla = Extract.derive({
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
        
        extract = new Chamomile();
        // test
        extract.rules['Rule A']().should.equal('a');
        extract.rules['Rule B']().should.equal('b');
        extract.rules['Rule C']().should.not.equal('c');
        extract.rules['Rule C']().should.equal('C');
        extract.events['Event A']().should.equal('a');
        extract.events['Event B']().should.equal('b');
        extract.events['Event C']().should.not.equal('c');
        extract.events['Event C']().should.equal('C');
    });
    
});