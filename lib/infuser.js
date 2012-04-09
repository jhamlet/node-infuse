
(function (exports) {
    
    var Proteus  = require("proteus"),
        FS       = require("fs"),
        Path     = require("path"),
        Iterator = require("./iterator"),
        uglylib  = require("uglify-js"),
        jsp      = uglylib.parser,
        jsb      = uglylib.uglify,
        PClass   = Proteus.Class,
        isArray  = Array.isArray,
        infuseTmpls = FS.readFileSync(__dirname + "/infuse.tmpl", "utf8"),
        infuseTmpl, modulesTmpl,
        Infuser
    ;
    
    infuseTmpls = infuseTmpls.split("// --- split ---\n");
    infuseTmpl  = infuseTmpls[0];
    modulesTmpl = infuseTmpls[1];

    //-----------------------------------------------------------------------
    // Private/Utilities
    //-----------------------------------------------------------------------
    // function 
    //-----------------------------------------------------------------------
    // Public/Exports
    //-----------------------------------------------------------------------
    module.exports = Infuser = PClass.derive({
        
        init: function (ast, opts) {
            var paths = opts && opts.libPaths;
            
            this.iterator = new Iterator(ast);
            
            if (paths) {
                delete opts.libPaths;
            }
            
            this.options = Proteus.merge({}, this.options, opts || {});
            
            if (paths) {
                this.options.libPaths = this.options.libPaths.concat(paths);
            }
            /**
             * A map of all "requires" called in this Infuser's AST
             * 
             * @property infusions
             * @type {object}
             */
            this.infusions = {};
        },
        
        /**
         * 
         * @property options
         * @type {object}
         */
        options: {
            /**
             * Array of paths to find node.js builtin module source files.
             * 
             * @option libPaths
             * @type {array[string]}
             */
            libPaths: process.env.NODE_LIB ?
                process.env.NODE_LIB.split(":").map(Boolean) : []
            
            /**
             * Map of external definitions
             * 
             * @option definitions
             * @type {object}
             * @default undefined
             */
        },
        
        infuse: function () {
            var iter = this.iterator,
                node = iter.getCurrent()
            ;

            while (node) {
                if (node.name === "name" && node[1] === "require") {
                    this.processRequire(iter);
                }
                iter.skipTo("name");
                node = iter.getCurrent();
            }
            
            this.infused = true;
            return this;
        },
        
        getAst: function () {
            if (!this.infused) {
                this.infuse();
            }
            return this.iterator.subject;
        },
        
        getInfusions: function () {
            if (!this.infused) {
                this.infuse();
            }
            return this.infusions;
        },
        
        processRequire: function (iter) {
            var node = iter.getCurrent(),
                callNode     = iter.getParent(node),
                moduleName   = callNode[2][0][1],
                modulePath   = require.resolve(moduleName),
                nodeLibPaths = this.options.libPaths || []
            ;

            if (modulePath.indexOf("/") !== 0) {
                nodeLibPaths.some(function (libPath) {
                    var path = Path.join(libPath, moduleName + ".js"),
                        lib = Path.join(libPath, "lib", moduleName + ".js"),
                        pathexists = Path.existsSync(path),
                        libexists = Path.existsSync(lib)
                    ;

                    modulePath = pathexists ?
                        path :
                        libexists ?
                            lib :
                            modulePath;

                    return pathexists || libexists;
                });
            }

            if (!Path.existsSync(modulePath)) {
                throw "Module '" + moduleName + "' does not exist.";
            }

            node[1] = "infuse";
        }
    });
    
}(module.exports));
