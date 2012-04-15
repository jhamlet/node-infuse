(function () {
    var doc = typeof document !== "undefined" ? document : false,
        hdr = doc && doc.getElementsByTagName("head")[0]
    ;
    
    __infuse__ = function (modId, callback) {
        var $_       = __infuse__,
            mod      = $_.modules[modId],
            exports  = $_.exported || ($_.exported = []),
            exported = exports[modId],
            node, src
        ;

        if (exported) {
            return mod;
        }
        
        if (typeof mod === "function") {
            $_.modules[modId] = (mod = mod());
        }
        else if (typeof mod === "string") {
            src = "__infuse__.$m = (function(){\n" +
                "var module = { exports: {} }, exports = module.exports;\n" +
                mod + "\n" +
                "return module.exports;\n" +
                "}());";
            
            if (doc) {
                hdr = doc.getElementsByTagName("head")[0];
                node = doc.createElement("script");
                node.innerHTML = src;
                hdr.appendChild(node);
            }
            else {
                eval(src);
            }
            
            $_.modules[modId] = mod = __infuse__.$m;
            delete __infuse__.$m;

            if (doc) {
                hdr.removeChild(node);
            }
        }

        exports[modId] = true;
        
        if (callback) {
            callback(mod);
        }
        
        return mod;
    };
}());
