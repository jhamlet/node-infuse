
(function () {
    
    var Proteus   = require("proteus"),
        FS        = require("fs"),
        Path      = require("path"),
        reqUtil   = require("./util-require"),
        Iterator  = require("./iterator"),
        Infusions = require("./infusions"),
        ASTUtil   = require("./util-ast"),
        uglylib   = require("uglify-js"),
        jsp       = uglylib.parser,
        jsb       = uglylib.uglify,
        PClass    = Proteus.Class,
        Infuser
    ;
    //-----------------------------------------------------------------------
    // Privates
    //-----------------------------------------------------------------------
    function processRequire (iter) {
        var node        = iter.getCurrent(),
            callNode    = iter.getParent(node),
            nameNode    = callNode[2][0],
            moduleName  = nameNode[1],
            opts        = this.options,
            libPaths    = opts.libPaths,
            modulePath  = reqUtil.resolveFrom(this.dirpath, moduleName, libPaths),
            infusions   = this.infusions
        ;
        
        if (!infusions.has(modulePath)) {
            infusions.add(modulePath, this.clone());
        }
        
        node[1] = "__infuse__";
        nameNode[0] = "num";
        nameNode[1] = infusions.getId(modulePath);
    }
    
    function processDefinition (iter) {
        var node        = iter.getCurrent(),
            nodeName    = node.name,
            nodeVal     = node[1],
            parentNode  = iter.getPrevious(node),
            opts        = this.options,
            defs        = opts.definitions,
            isCallNode  = parentNode.name === "call",
            subfuser,
            args,
            val
        ;
        
        // console.log(require("util").inspect(parentNode, false, 100));
        
        if (isCallNode && typeof defs[nodeVal] === "function") {
            this.clone().infuseAst(parentNode[2]);
            
            args = parentNode[2].map(function (arg) { return ASTUtil.astToValue(arg); });
            val = defs[nodeVal].apply(defs, args);
            node = parentNode;
        }
        else if (defs.hasOwnProperty(nodeVal)) {
            val = defs[nodeVal];
        }
        
        ASTUtil.valueToAst(val, node);
    }
    //-----------------------------------------------------------------------
    // Public/Exports
    //-----------------------------------------------------------------------
    module.exports = Infuser = PClass.derive({
        /**
         * @param opts {object}
         *      reserved {array[string]} list of reserved words not to mangle
         *      definitions {object}
         *      libPaths {array[string]}
         */
        init: function (opts) {
            this.options = Proteus.merge({}, this.options, opts || {});
        },
        
        /**
         * @property options
         * @type {object}
         */
        options: {},
        
        /**
         * 
         * @method infuse
         * @param path {string} path to the input file, or a javascript
         *      parseable string
         * @param isSrc {boolean} optional
         * @returns {object} the infuser instance
         */
        infuse: function (path, isSrc) {
            var iter, node, nameVal, defs;

            if (!isSrc && Path.existsSync(path)) {
                this.filepath = path;
                this.source = FS.readFileSync(path, "utf8");
            }
            else {
                this.filepath = process.cwd();
                this.source = path;
            }
            
            this.dirpath = Path.dirname(this.filepath);
            this.infusions = this.options.infusions || new Infusions();

            this.infuseAst(jsp.parse(this.source));
            
            return this;
        },
        
        infuseAst: function (ast) {
            var iter = this.iterator = new Iterator(ast),
                defs = this.options.definitions,
                node,
                nameVal
            ;
            
            node = iter.getCurrent();
            
            while (node) {
                if (node.name === "name") {
                    nameVal = node[1];
                    if (nameVal === "require") {
                        processRequire.call(this, iter);
                    }
                    else if (nameVal && defs && defs.hasOwnProperty(nameVal)) {
                        processDefinition.call(this, iter);
                    }
                }
                iter.skipTo("name");
                node = iter.getCurrent();
            }
            
            return this;
        },
        
        getAst: function (minify) {
            var ast     = this.iterator.subject,
                opts    = this.options
            ;
            
            if (minify) {
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
            
            return ast;
        },
        
        getCode: function (minify) {
            var ast = this.getAst(minify);
            return jsb.gen_code(ast, { beautify: !minify });
        },
        
        clone: function () {
            var opts = this.options,
                subfuser = new Infuser({
                    reserved:    opts.reserved,
                    embed:       opts.embed,
                    definitions: opts.definitions,
                    libPaths:    opts.libPaths,
                    infusions:   this.infusions
                })
            ;

            return subfuser;
        },
        
        cloneAndInfuse: function (path) {
            this.clone().infuse(path);
            return this;
        }
        
    });
    
}());
