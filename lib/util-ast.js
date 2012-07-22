
(function () {
    var Proteus         = require("proteus"),
        uglylib         = require("uglify-js"),
        VM              = require("vm"),
        jsp             = uglylib.parser,
        jsb             = uglylib.uglify,
        isArray         = Array.isArray,
        beautifully     = { beautify: true },
        AST_NAME_KEYS   = {
            "intern":       "name",
            "number":       "num",
            "string":       "string",
            "function":     "defun",
            "object":       "object",
            "array":        "array",
            "true":         true,
            "false":        false,
            "undefined":    undefined,
            "null":         null
        },
        keysMap         = AST_NAME_KEYS,
        __tmpFn__
    ;

    function spliceNode (node, start, end /*rest...*/) {
        var args = Proteus.slice(arguments, 3) || [];
        node.splice.apply(node, [start, end].concat(args));
    }

    function replaceNode (node, newnode) {
        spliceNode.apply(this, [node, 0, node.length].concat(newnode));
    }

    function valueToAst (val, ast) {
        var type = typeof val,
            fnName, fnStr
        ;
    
        ast = ast || [];
        ast.length = 0;
        ast[0] = keysMap[type];

        switch (type) {
            case "object":
                if (val.ast) {
                    replaceNode(ast, val.ast);
                }
                else if (Array.isArray(val)) {
                    ast[0] = keysMap.array;
                    ast[1] = val.map(function (i) { return valueToAst(i); });
                }
                else {
                    ast[0] = keysMap.object;
                    ast[1] = [];
                    Object.keys(val).forEach(function (k) {
                        ast[1].push([k, valueToAst(val[k])]);
                    });
                }
                break;
            case "function":
                // uglify has a problem parsing anonymous functions that are
                // not being assigned to something, so we fudge the input a bit
                ast[0] = "function";
                ast[1] = fnName = (val.name || null);
                fnStr = val.toString();
                fnStr = fnName ? fnStr : fnStr.replace(/^function/, "function foo");
            
                jsp.parse(fnStr)[1][0].forEach(function (v, i) {
                    if (i > 1) {
                        ast[i] = v;
                    }
                });

                break;
            case "boolean":
            case "undefined":
            case "null":
                ast[0] = keysMap.intern;
                ast[1] = val;
                break;
            default:
                ast[1] = val;
        }
    
        return ast;
    }

    function astToValue (ast) {
        var obj, fn, fnName, fnArgs, fnBody;

        switch (ast[0]) {
            case "name":
            case "dot":
            case "call":
                return {ast: ast};
            case keysMap.string:
            case keysMap.number:
                return ast[1];
            case keysMap.object:
                obj = {};
                ast[1].forEach(function (prop) {
                    obj[prop[0]] = astToValue(prop[1]);
                });
                return obj;
            case keysMap.array:
                return ast[1].map(function (v) { return valueToAst(v); });
            case keysMap["function"]:
            case "function":
                fnName = ast[1];
                fnArgs = ast[2];
                fnBody = jsb.gen_code(["toplevel", ast[3]], beautifully);
                fn = VM.runInThisContext("__tmpFn__ = function " + (fnName ? fnName : "") +
                    "(" + fnArgs.join(", ") + ") {" + fnBody + "}"
                );
                return fn;
        }
    }

    module.exports = function (altKeysMap) {
        keysMap = altKeysMap;
    };

    Proteus.merge(module.exports, {
    
        DEFAULT_KEY_MAPPING: AST_NAME_KEYS,
    
        astToValue: astToValue,
    
        valueToAst: valueToAst,
    
        spliceNode: spliceNode,
    
        replaceNode: replaceNode
    
    });

}());
