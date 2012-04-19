
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
        var nominify = opts.nominify || false,
            beautify = { beautify: nominify },
            embed    = opts.embed || false,
            reserved = opts.reserved,
            infuser,
            infusions,
            count,
            ast,
            iter,
            modNode
        ;
        
        infuser = new Infuser({
            definitions: opts.definitions,
            reserved:    reserved,
            libPaths:    opts.libPaths,
            embed:       embed
        });
        
        
        ast = infuser.infuse(src);
        infusions = infuser.infusions;
        
        if (opts.dumpPaths) {
            return infusions.getPaths().join("\n") + "\n";
        }
        
        count = infusions.count;
        
        if (count) {
            ast[1] = infusions.toAst().concat(ast[1]);
        }
        
        if (!nominify) {
            ast = jsb.ast_lift_variables(ast);
            ast = jsb.ast_mangle(ast, {
                toplevel: true,
                except: reserved
            });
            ast = jsb.ast_squeeze(ast, {
                make_seqs: true,
                dead_code: true
            });
        }
        
        if (embed && count) {
            // if we are embedding the modules as strings we need to search
            // for our infused modules object
            iter = new Iterator(ast);
            
            modNode = iter.findAll(function (node) {
                return node[0] === "dot" &&
                    node[1] && node[1][0] && node[1][0] === "name" &&
                    node[1][1] === "$i" &&
                    node[2] && node[2] === "modules";
            })[3]; // probably shouldn't assume it's always the 4th one...
            
            iter.start();
            modNode = iter.skipToNode(modNode);
            modNode = iter.getParent(modNode);

            // replace the code with a string
            modNode[3][1].forEach(function (prop) {
                prop[1] = [
                    "string",
                    jsb.gen_code(prop[1], beautify)
                ];
            });
        }
        
        return opts.dumpAst ? 
                require("util").inspect(ast, false, 1000000) :
                jsb.gen_code(ast, beautify);
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
