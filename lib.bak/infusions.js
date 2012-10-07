
var Proteus      = require("proteus"),
    Path         = require("path"),
    FS           = require("fs"),
    Iterator     = require("./iterator"),
    astUtil      = require("./util-ast"),
    jsp          = require("uglify-js").parser,
    infuseTmpl   = FS.readFileSync(Path.join(__dirname, "tmpl-infuse.txt"), "utf8"),
    makeInfusion = require("./make-infusion"),
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
        items[id] = makeInfusion(
            id,
            infuser.cloneAndInfuse(path)[1],
            this.options.embed
        );
            
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
    
    getPaths: function () {
        var paths = this.pathMap,
            items = this.items
        ;
        
        return Object.keys(paths).sort(function (a, b) {
            return paths[a] - paths[b];
        });
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

        return tmplAst[1];
    }
});