
var Proteus  = require("proteus"),
    Path     = require("path"),
    FS       = require("fs"),
    Iterator = require("./iterator"),
    astUtil  = require("./util-ast"),
    jsp      = require("uglify-js").parser,
    rf       = FS.readFileSync,
    infuseTmpl        = rf(Path.join(__dirname, "tmpl-infuse.js"), "utf8"),
    infusionTmpl      = require("./tmpl-infusion"),
    // infusionTmpl      = rf(Path.join(__dirname, "tmpl-infusion.js"), "utf8"),
    infusionEmbedTmpl = require("./tmpl-infusion-embed"),
    // infusionEmbedTmpl = rf(Path.join(__dirname, "tmpl-infusion-embed.js"), "utf8"),
    Infusions
;
//---------------------------------------------------------------------------
// Public/Exports
//---------------------------------------------------------------------------
module.exports = Infusions = Proteus.Class.derive({
    
    init: function (opts) {
        opts = this.options = Proteus.merge({}, this.options, opts || {});
        this.items = [];
        this.pathMap = {};
    },
    
    options: {},
    
    has: function (path) {
        return this.pathMap.hasOwnProperty(path);
    },
    
    add: function (path, infuser) {
        var items = this.items,
            id,
            ast
        ;
        
        id = items.length;
        this.pathMap[path] = id;
        items.push(undefined);
        // need to infuse AFTER the path and id are set to avoid infinite recursions
        ast = infuser.cloneAndInfuse(path)[1];
        items[id] = this.options.embed ?
            infusionEmbedTmpl(id, ast) :
            infusionTmpl(id, ast);
            
        return id;
    },
    
    get count () {
        return this.items.length;
    },
    
    get: function (id) {
        return this.items[id];
    },
    
    getId: function (path) {
        return this.pathMap[path];
    },
    
    toAst: function () {
        var tmplAst = jsp.parse(infuseTmpl),
            modAst = ["object", []],
            values = modAst[1],
            items = this.items,
            len = items.length,
            i = 0
        ;
        
        for (; i < len; i++) {
            values.push([i, items[i]]);
        }
        
        (new Iterator(tmplAst)).
            findAllNamesOf("INFUSE_MODULES").forEach(function (node) {
                astUtil.replaceNode(node, modAst);
            });

        // console.log(require("util").inspect(tmplAst, false, 100));
            
        return tmplAst[1];
    }
});