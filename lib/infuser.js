
(function () {
    
    var Proteus   = require("proteus"),
        FS        = require("fs"),
        Path      = require("path"),
        Iterator  = require("./iterator"),
        Infusions = require("./infusions"),
        reqUtil   = require("./util-require"),
        ASTUtil   = require("./util-ast"),
        jsp       = require("uglify-js").parser,
        PClass    = Proteus.Class,
        isArray   = Array.isArray,
        Infuser
    ;
    //-----------------------------------------------------------------------
    // Privates
    //-----------------------------------------------------------------------
    
    //-----------------------------------------------------------------------
    // Public/Exports
    //-----------------------------------------------------------------------
    module.exports = Infuser = PClass.derive({
        /**
         * @param opts {object}
         *      definitions {object}
         *      libPaths {array[string]}
         *      embed {boolean}
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
         * @param path {string|array} path to the input file, or a javascript
         *      parseable string
         * @param isSrc {boolean} optional
         * @returns {object} the infuser instance
         */
        infuse: function (path, isSrc) {
            var src;

            if (!isSrc && Path.existsSync(path)) {
                this.filepath = Path.resolve(path);
                src = this.source = FS.readFileSync(this.filepath, "utf8");
            }
            else {
                this.filepath = process.cwd();
                src = this.source = path;
            }
            
            this.dirpath = Path.dirname(this.filepath);
            this.infusions = this.options.infusions ||
                                new Infusions({
                                    embed: this.options.embed
                                });
            
            return this.infuseAst(jsp.parse(src));
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
                        this.processRequire(iter);
                    }
                    else if (nameVal && defs && defs.hasOwnProperty(nameVal)) {
                        this.processDefinition(iter);
                    }
                }
                iter.skipTo("name");
                node = iter.getCurrent();
            }

            return iter.subject;
        },
        
        addInfusion: function (path) {
            var infusions = this.infusions;
            
            if (!infusions.has(path)) {
                infusions.add(path, this);
            }
            
            return ["call", ["name", "__infuse__"], [
                        [ "num", infusions.getId(path) ]
                ] ];
        },
        
        processRequire: function (iter) {
            var node        = iter.getCurrent(),
                callNode    = iter.getParent(node),
                nameNode    = callNode[2][0],
                moduleName  = nameNode[1],
                opts        = this.options,
                libPaths    = opts.libPaths,
                modulePath  = reqUtil.resolveFrom(this.dirpath, moduleName, libPaths),
                infusions   = this.infusions
            ;

            ASTUtil.replaceNode(callNode, this.addInfusion(modulePath));
        },

        processDefinition: function (iter) {
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
        },

        clone: function () {
            var opts = this.options,
                subfuser = new Infuser({
                    embed:       opts.embed,
                    definitions: opts.definitions,
                    libPaths:    opts.libPaths,
                    infusions:   this.infusions
                })
            ;

            return subfuser;
        },
        
        cloneAndInfuse: function (path) {
            return this.clone().infuse(path);
        }
        
    });
    
}());
