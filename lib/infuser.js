
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
        tmplRegEx = /\$([^\$]+)\$/g,
        infuseTmpl, modulesTmpl,
        Infuser
    ;
    
    infuseTmpls = infuseTmpls.split("// --- split ---\n");
    infuseTmpl  = infuseTmpls[0];
    modulesTmpl = infuseTmpls[1];

    //-----------------------------------------------------------------------
    // Utilities
    //-----------------------------------------------------------------------
    function resolveRequire (libPaths, moduleName) {
        var modulePath   = require.resolve(moduleName);
        
        if (modulePath.indexOf("/") !== 0) {
            libPaths.some(function (libPath) {
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
        
        return modulePath;
    }
    
    function textReplace (tmpl, map) {
        return tmpl.replace(tmplRegEx, function () {
            var key = arguments[1];
            return key && map[key] || "";
        });
    }
    
    //-----------------------------------------------------------------------
    // Privates
    //-----------------------------------------------------------------------
    function processRequire (iter) {
        var node = iter.getCurrent(),
            callNode    = iter.getParent(node),
            nameNode    = callNode[2][0],
            moduleName  = nameNode[1],
            opts        = this.options,
            libPaths    = opts.libPaths,
            modulePath  = resolveRequire(libPaths, moduleName),
            src,
            ast,
            infuser
        ;
        
        if (!this.infusions[modulePath]) {
            this.infusions[modulePath] = true;
            
            src = FS.readFileSync(modulePath, "utf8");
            ast = jsp.parse(src);

            infuser = new Infuser(ast, { libPaths: opts.libPaths });
            infuser.infusions = this.infusions;
            infuser.infuse();
            
            src = textReplace(modulesTmpl, {
                key: modulePath,
                code: jsb.gen_code(ast, { beautify: true })
            });
            
            this.infusions[modulePath] = src;
            // console.log(src);
        }
        
        node[1] = "infuse";
        nameNode[1] = modulePath;
    }
    
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
            var iter, node;

            if (!this.infused) {
                iter = this.iterator;
                node = iter.getCurrent();
                
                while (node) {
                    if (node.name === "name" && node[1] === "require") {
                        processRequire.call(this, iter);
                    }
                    iter.skipTo("name");
                    node = iter.getCurrent();
                }

                this.infused = true;
            }
            
            return this;
        },
        
        getAst: function () {
            var ast = this.infuse().iterator.subject,
                modules = this.infusions,
                tmpl
            ;
            
            tmpl = textReplace(infuseTmpl, {
                modules: Object.keys(modules).map(function (key) {
                    return modules[key];
                }).join(",\n")
            });
            
            ast[1].unshift(
                jsp.parse(tmpl, { beautify: true })[1][0]
            );
            
            return ast;
        },
        
        getInfusions: function () {
            return this.infuse().infusions;
        }
        
    });
    
}(module.exports));
