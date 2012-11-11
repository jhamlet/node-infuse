/*globals suite, setup, test */

var Infuser = require('infuse/infuser'),
    Ast     = require('infuse/ast'),
    childKeys = require('infuse/ast/node/child-keys'),
    Extract = require('infuse/extract'),
    DefinesExtract = require('infuse/extracts/defines'),
    Esprima = require('esprima'),
    FS      = require('fs'),
    wrapNode = require('infuse/ast/node'),
    srcfile = 'test-src/underscore.js'
;

suite("Infuser Speed Tests", function () {
    var infuser = new Infuser();
    
    test('Baseline - Plain recursive walk through Esprima parsed AST', function () {
        var 
            ast = Esprima.parse(FS.readFileSync(srcfile, 'utf8')),
            isArray = Array.isArray,
            count = 0,
            then
        ;
        
        function walk (node) {
            count++;
            childKeys[node.type].forEach(function (key) {
                var val = node[key];
                if (isArray(val)) {
                    val.forEach(walk);
                }
                else if (val && typeof val === 'object') {
                    walk(val);
                }
            });
        }

        then = Date.now();
        walk(ast);
        
        console.log("%s nodes: %sms", count, Date.now() - then);
    });
    
    test('Recursive walk, but using nodeWrapper', function () {
        var 
            ast = Esprima.parse(FS.readFileSync(srcfile, 'utf8')),
            isArray = Array.isArray,
            count = 0,
            then
        ;

        function walk (node) {
            count++;
            wrapNode(node).childNodes.forEach(function (child) {
                walk(child);
            });
        }
        
        then = Date.now();
        walk(ast);
        
        console.log("%s nodes: %sms", count, Date.now() - then);
    });

    test('Recursive walk, faking childKeys/childNodes', function () {
        var 
            ast = Esprima.parse(FS.readFileSync(srcfile, 'utf8')),
            isArray = Array.isArray,
            count = 0,
            then
        ;

        function walk (node) {
            count++;
            node.childKeys = childKeys[node.type];
            wrapNode.properties.childNodes.get.call(node).forEach(function (child) {
                walk(child);
            });
        }
        
        then = Date.now();
        walk(ast);
        
        console.log("%s nodes: %sms", count, Date.now() - then);
    });
    
    // test('Raw object used as extract', function () {
    //     var seen = false;
    //     
    //     infuser.use({
    //         rules: {
    //             'Identifier': function (node) {
    //                 seen = true;
    //                 node.type.should.equal('Identifier');
    //             }
    //         }
    //     });
    //     
    //     infuser.run(srcfile);
    //     seen.should.equal(true);
    // });
    // 
    // test('Extract', function () {
    //     // var defines = new DefinesExtract({});
    //     var defines = new Extract();
    //     infuser.use(defines);
    //     infuser.run(srcfile);
    // });
    
    test('Straight AST Traversal', function () {
        var ast = new Ast({ file: srcfile }),
            count = 0,
            then
        ;
        
        then = Date.now();
        ast.traverse({
            enter: function (node) {
                
            },
            leave: function (node) {
                count++;
            }
        });
        
        console.log("%s nodes: %sms", count, Date.now() - then);
    });
});