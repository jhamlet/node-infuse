/*globals suite, test, setup, teardown */

var should  = require("should"),
    SysUtil = require("util"),
    Path    = require("path"),
    resolve = require("../lib/resolve")
;

suite("util-resolve", function () {
    
    test("local directory require", function () {
        var path;
        
        path = resolve(__dirname, "./sample-module.js");
        path.should.eql(Path.join(__dirname, "./sample-module.js"));
    });
    
    test("relative require", function () {
        var basepath = Path.join(__dirname, "node_modules"),
            path;
        
        path = resolve(basepath, "../sample-module");
        path.should.eql(Path.join(__dirname, "./sample-module.js"));
        
        basepath = Path.join(__dirname, "..");
        path = resolve(basepath, "./test/sample-module");
        path.should.eql(Path.join(__dirname, "sample-module.js"));

        basepath = Path.join(__dirname, "../..");
        path = resolve(basepath, "./node-infuse/test/sample-module");
        path.should.eql(Path.join(__dirname, "sample-module.js"));
    });
    
    test("node_modules require", function () {
        var path;
        
        path = resolve(__dirname, "testing");
        path.should.eql(Path.join(__dirname, "node_modules/testing.js"));
    });
    
});