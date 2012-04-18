
(function () {
    
    var Proteus  = require("proteus"),
        FS       = require("fs"),
        uglylib  = require("uglify-js"),
        Infuser  = require("./infuser"),
        Iterator = require("./iterator"),
        astUtil  = require("./util-ast"),
        jsp      = uglylib.parser,
        jsb      = uglylib.uglify
    ;
    
    //-----------------------------------------------------------------------
    // Exports
    //-----------------------------------------------------------------------
    function infuse (src, opts) {
        var infuser, infusions, ast, code, modNode;
        
        infuser = new Infuser({
            definitions: opts.definitions,
            reserved:    opts.reserved,
            libPaths:    opts.libPaths,
            embed:       opts.embed
        });
        
        ast = infuser.infuse(src);
        infusions = infuser.infusions;
        
        if (infusions.count) {
            ast[1] = infusions.toAst().concat(ast[1]);
        }
        
        if (!opts.nominify) {
            ast = jsb.ast_lift_variables(ast);
            ast = jsb.ast_mangle(ast, {
                toplevel: true,
                except: opts.reserved
            });
            ast = jsb.ast_squeeze(ast, {
                make_seqs: false,
                dead_code: true
            });
        }
        // generate the code once...
        code = jsb.gen_code(ast, { beautify: opts.nominify });
        
        if (opts.embed && infusions.count) {
            // if we are embedding the modules as strings we need to parse
            // and search for our infused modules object
            ast = jsp.parse(code);
            iter = new Iterator(ast);
            
            modNode = iter.findAll(function (node) {
                return node[0] === "dot" &&
                    node[1] && node[1][0] && node[1][0] === "name" &&
                    node[1][1] === "$i" &&
                    node[2] && node[2] === "modules";
            })[3];
            
            iter.start();
            modNode = iter.skipToNode(modNode);
            modNode = iter.getParent(modNode);

            // replace the code with a string
            modNode[3][1].forEach(function (prop) {
                prop[1] = [
                    "string",
                    jsb.gen_code(prop[1], { beautify: opts.nominify})
                ];
            });
            
            // re-generate the code
            code = jsb.gen_code(ast, { beautify: opts.nominify });
        }
        
        return opts.dumpAst ? 
                require("util").inspect(ast, false, 1000000) :
                code;
    }
    
    Proteus.merge(infuse, {
        Iterator:    require("./iterator"),
        Infuser:     Infuser,
        Infusions:   require("./infusions.js"),
        astUtil:     require("./util-ast"),
        requireUtil: require("./util-require")
    });
    
    module.exports = infuse;
}());
