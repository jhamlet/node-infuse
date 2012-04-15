
(function () {
    
    var Proteus = require("proteus"),
        uglylib = require("uglify-js"),
        Infuser = require("./infuser"),
        jsp     = uglylib.parser,
        jsb     = uglylib.uglify
    ;
    
    function infuse (src, opts) {
        var ast = jsp.parse(src),
            squeezeOpts = {
                make_seqs: false,
                dead_code: true
            },
            mangleOpts  = {},
            codeOpts    = {
                beautify: opts.nominify
            }
        ;
        
        if (opts.reserved) {
            mangleOpts.except = opts.reserved;
        }
        
        ast = new Infuser(ast, {
            libPaths:    opts.nodeLibPaths,
            definitions: opts.definitions,
            embed:       opts.embed
        }).getAst();
        
        if (!opts.nominify) {
            ast = jsb.ast_lift_variables(ast);
            ast = jsb.ast_mangle(ast, mangleOpts);
            ast = jsb.ast_squeeze(ast, squeezeOpts);
        }
        
        return jsb.gen_code(ast, codeOpts);
    }
    
    Proteus.merge(infuse, {
        Iterator: require("./iterator"),
        Infuser:  Infuser,
        astUtil:  require("./ast-util")
    });
    
    module.exports = infuse;
}());