
(function () {
    
    var Proteus  = require("proteus"),
        FS       = require("fs"),
        uglylib  = require("uglify-js"),
        template = require("underscore").template,
        Infuser  = require("./infuser"),
        Iterator = require("./iterator"),
        jsp      = uglylib.parser,
        jsb      = uglylib.uglify,
        infuseTmpl,
        fnTmpl, strTmpl
    ;
    
    //-----------------------------------------------------------------------
    // Templates
    //-----------------------------------------------------------------------
    infuseTmpl = FS.readFileSync(__dirname + "/infuse-src.js", "utf8");
    
    fnTmpl = template([
        "\"<%=key%>\": function () {",
            "var module  = __infuse__.modules[<%=key%>], exports = module.exports;",
            "<%=code%>",
            "__infuse__.clear(<%=key%>);",
        "}"
    ].join("\n"));
    
    strTmpl = template("\"<%=key%>\": \"<%=code%>\"");
    
    //-----------------------------------------------------------------------
    // Exports
    //-----------------------------------------------------------------------
    function infuse (src, opts) {
        var infuser, ast, infuserAst, modCode, modAst, iter;
        
        infuser = new Infuser({
            definitions: opts.definitions,
            reserved:    opts.reserved,
            libPaths:    opts.libPaths
        });
        
        ast = infuser.infuse(src).getAst();
        
        // generate our main template AST
        infuserAst = jsp.parse(infuseTmpl);
        // generate our modules AST
        modCode = "__infuse__.modules = {" + 
            infuser.infusions.items.map(function (infusion, id) {
                var code = infusion.getCode(!opts.nominify);  

                if (opts.embed) {
                    code = code.replace(/\"/g, "\\\"");
                }

                return (opts.embed ? strTmpl : fnTmpl)({
                    key: id,
                    code: code
                });
            }).join(",\n") + "};";
        
        modAst = jsp.parse(modCode);

        // determine where to insert our module AST
        iter = new Iterator(infuserAst);
        iter.skipTo("function");
        iter.getCurrent()[3].push(modAst[1][0]);

        // Update the final AST with the infuser AST
        ast[1] = infuserAst[1].concat(ast[1]);

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
