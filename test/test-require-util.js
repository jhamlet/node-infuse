/*globals suite, test, setup, teardown */

var should  = require("should"),
    SysUtil = require("util"),
    Path    = require("path"),
    reqUtil = require("../lib/require-util")
;

suite("resolveRequireFrom", function () {
    
    test("local directory require", function () {
        var path;
        
        // The following should be equivalent
        path = reqUtil.resolveFrom(__dirname, "./sample-module.js");
        path.should.eql(Path.join(__dirname, "./sample-module.js"));
        
        path = reqUtil.resolveFrom(__dirname, "./sample-module");
        path.should.eql(Path.join(__dirname, "./sample-module.js"));
    });
    
    test("relative require", function () {
        var basepath = Path.join(__dirname, "node_modules"),
            path;
        
        path = reqUtil.resolveFrom(basepath, "../sample-module");
        path.should.eql(Path.join(__dirname, "./sample-module.js"));
        
        basepath = Path.join(__dirname, "..");
        path = reqUtil.resolveFrom(basepath, "test/sample-module");
        path.should.eql(Path.join(__dirname, "sample-module.js"));

        basepath = Path.join(__dirname, "../..");
        path = reqUtil.resolveFrom(basepath, "node-infuse/test/sample-module");
        path.should.eql(Path.join(__dirname, "sample-module.js"));
    });
    
    test("node_modules require", function () {
        var path;
        
        path = reqUtil.resolveFrom(__dirname, "testing");
        path.should.eql(Path.join(__dirname, "node_modules/testing.js"));
    });
    
    test("nodeLib require", function () {
        var nodeLibs = [Path.join(__dirname, "node_lib")],
            path;
        
        path = reqUtil.resolveFrom(__dirname, "builtin", nodeLibs);
        path.should.eql(Path.join(__dirname, "node_lib", "builtin.js"));
        
        path = reqUtil.resolveFrom(__dirname, "other-builtin", nodeLibs);
        path.should.eql(Path.join(__dirname, "node_lib", "lib", "other-builtin.js"));
    });
});