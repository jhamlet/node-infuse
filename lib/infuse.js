
(function () {
    
    var Proteus  = require("proteus"),
        FS       = require("fs"),
        uglylib  = require("uglify-js"),
        Infuser  = require("./infuser"),
        Iterator = require("./iterator"),
        astUtil  = require("./util-ast"),
        jsp      = uglylib.parser,
        jsb      = uglylib.uglify,
        rf       = FS.readFileSync,
        infuseTmpl   = rf(__dirname + "/infuse-src.js", "utf8"),
        infusionTmpl = rf(__dirname + "/infusion-src.js", "utf8"),
        embedTmpl    = rf(__dirname + "/infusion-embed-src.js", "utf8"),
        infuseAst    = jsp.parse(infuseTmpl)
    ;
    
    function makeInfusion (id, infusion, embed, minify, reserved) {
        var tmplAst = jsp.parse(embed ? embedTmpl : infusionTmpl)[1],
            infAst = infusion.getAst(),
            iter
        ;
        
        infAst = minify ?
            jsb.ast_mangle(infAst, {
                toplevel: true,
                except: reserved
            })[1] :
            infAst = infAst[1];
        
        tmplAst = embed ? tmplAst[0][1] : tmplAst[0][1][3];
        infAst = embed ? infAst[0][1] : infAst[0][1];

        iter = new Iterator(tmplAst);
        
        iter.findAllNames("MODULE_ID").forEach(function (node) {
            node.splice.apply(node, [0, node.length].concat(["num", id]));
        });
        
        iter.findAllNames("MODULE").forEach(function (node) {
            node.splice.apply(node, [0, node.length].concat(infAst));
        });
        
        return embed ?
            ["string", jsb.gen_code(tmplAst, { dead_code: true})] :
            tmplAst;
    }
    //-----------------------------------------------------------------------
    // Exports
    //-----------------------------------------------------------------------
    function infuse (src, opts) {
        var infuser, infusions, ast, modAst, objAst, moditer;
        
        infuser = new Infuser({
            definitions: opts.definitions,
            reserved:    opts.reserved,
            libPaths:    opts.libPaths
        });
        
        ast = infuser.infuse(src).getAst();
        
        infusions = infuser.infusions.items;
        if (infusions.length) {
            modAst = jsp.parse("__infuse__.modules = {};")[1][0];
            objAst = modAst[1][3][1];
            
            infusions.forEach(function (infusion, id) {
                objAst.push([
                    id,
                    makeInfusion(
                        id,
                        infusion,
                        opts.embed,
                        !opts.nominify,
                        opts.reserved
                    )
                ]);
            });
            
            ast[1] = infuseAst[1].concat(ast[1]);
            
            moditer = new Iterator(infuseAst);
            moditer.findAllNames("INFUSE_MODULES").forEach(function (node) {
                node.splice.apply(node, [0, node.length].concat(modAst));
            });
        }

        if (!opts.nominify) {
            ast = jsb.ast_lift_variables(ast);
            ast = jsb.ast_mangle(ast, {
                except: opts.reserved
            });
            ast = jsb.ast_squeeze(ast, {
                make_seqs: false,
                dead_code: true
            });
        }

        return opts.dumpAst ? 
                require("util").inspect(ast, false, 1000000) :
                jsb.gen_code(ast, { beautify: opts.nominify });
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
