
(function () {
    
    var Proteus  = require("proteus"),
        template = require("underscore").template,
        FS       = require("fs"),
        Path     = require("path"),
        Iterator = require("./iterator"),
        ASTUtil  = require("./ast-util"),
        uglylib  = require("uglify-js"),
        jsp      = uglylib.parser,
        jsb      = uglylib.uglify,
        PClass   = Proteus.Class,
        isArray  = Array.isArray,
        infuseTmpl,
        fnTmpl, strTmpl,
        Infuser
    ;
    //-----------------------------------------------------------------------
    // Templates
    //-----------------------------------------------------------------------
    infuseTmpl = FS.readFileSync(__dirname + "/infuse-include.js", "utf8");
    
    fnTmpl = template([
        "'<%=key%>': function () {",
            "var module  = { exports: {} }, exports = module.exports;",
            "<%=code%>",
            "return module.exports;",
        "}"
    ].join("\n"));
    
    strTmpl = template("'<%=key%>': '<%=code%>'");

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
            infusions   = this.infusions,
            idMap       = this.infusionsIdMap,
            infusionId  = idMap[modulePath] || this.infusionId++,
            src,
            ast
        ;
        
        if (!idMap[modulePath]) {
            idMap[modulePath] = infusionId;
            
            src = FS.readFileSync(modulePath, "utf8");
            ast = jsp.parse(src);

            this.cloneAndInfuse(ast);
            
            infusions[infusionId] = (opts.embed ? strTmpl : fnTmpl)({
                key: infusionId,
                code: jsb.gen_code(ast, { beautify: true })
            });
            
            // console.log(infusions[infusionId]);
        }
        
        node[1] = "__infuse__";
        nameNode[0] = "num";
        nameNode[1] = infusionId;
    }
    
    function processDefinition (iter) {
        var node        = iter.getCurrent(),
            nodeName    = node.name,
            nodeVal     = node[1],
            parentNode  = iter.getPrevious(node),
            opts        = this.options,
            defs        = opts.definitions,
            isCallNode  = parentNode.name === "call",
            args,
            val
        ;
        
        // console.log(require("util").inspect(parentNode, false, 100));
        
        if (isCallNode && typeof defs[nodeVal] === "function") {
            this.cloneAndInfuse(parentNode[2]);
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
            this.infusions      = {};
            this.infusionsIdMap = {};
            this.infusionId     = 1;
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
            var iter, node, nameVal, defs;

            if (!this.infused) {
                this.infused = true;
                
                iter = this.iterator;
                node = iter.getCurrent();
                defs = this.options.definitions;
                
                while (node) {
                    if (node.name === "name") {
                        nameVal = node[1];
                        if (nameVal === "require") {
                            processRequire.call(this, iter);
                        }
                        else if (nameVal && defs.hasOwnProperty(nameVal)) {
                            processDefinition.call(this, iter);
                        }
                    }
                    iter.skipTo("name");
                    node = iter.getCurrent();
                }
            }
            
            return this;
        },
        
        getAst: function () {
            var ast = this.infuse().iterator.subject,
                modules = this.infusions,
                idMap   = this.infusionsIdMap,
                tmpl    = infuseTmpl,
                infuserAst
            ;
            
            tmpl += ("__infuse__.modules = {" + 
                Object.keys(idMap).map(function (path) {
                    return modules[idMap[path]];
                }).join(",\n") + "};");
            
            infuserAst = jsp.parse(tmpl, { beautify: true })[1];
            infuserAst.reverse().forEach(function (stat) {
                ast[1].unshift(stat);
            });

            return ast;
        },
        
        getInfusions: function () {
            return this.infuse().infusions;
        },
        
        clone: function (ast) {
            var clone = new Infuser(ast || this.iterator.subject);
            
            clone.options    = this.options;
            clone.infusions  = this.infusions;
            clone.infusionsIdMap = this.infusionsIdMap;
            clone.infusionId = this.infusionId;
            
            return clone;
        },
        
        cloneAndInfuse: function (ast) {
            return this.clone(ast).infuse();
        }
        
    });
    
}());
