
(function () {
    
    var uglylib  = require("uglify-js"),
        Infuser  = require("./infuser"),
        jsp      = uglylib.parser,
        jsb      = uglylib.uglify
    ;
    
    module.exports = function (src, opts) {
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
        
        if (opts.definitions) {
            mangleOpts.defines = opts.definitions;
        }
        
        ast = new Infuser(ast, {
            libPaths:    opts.nodeLibPaths,
            definitions: mangleOpts.defines
        }).getAst();
        
        if (!opts.nominify) {
            ast = jsb.ast_lift_variables(ast);
            ast = jsb.ast_mangle(ast, mangleOpts);
            ast = jsb.ast_squeeze(ast, squeezeOpts);
        }
        
        return jsb.gen_code(ast, codeOpts);
    };
}());