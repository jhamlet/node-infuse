/*globals __infuse__ */

(function () {
    var doc = typeof document !== "undefined" ? document : false,
        hdr = doc && doc.getElementsByTagName("head")[0],
        $i
    ;
    
    $i = this.__infuse__ = function (modId, callback) {
        var module = $i.modules[modId],
            src,
            node
        ;
        
        if (!module.exports) {
            src = module;
            module = $i.modules[modId] = {
                exports: {},
                loading: true,
                loaded: false,
                loadCallback: callback
            };

            if (typeof src === "function") {
                src();
            }
            else if (typeof src === "string") {
                if (doc) {
                    hdr = doc.getElementsByTagName("head")[0];
                    node = doc.createElement("script");
                    node.innerHTML = src;
                    module.loadCallback = function (exports) {
                        hdr.removeChild(node);
                        if (callback) {
                            callback(exports);
                        }
                    };
                    hdr.appendChild(node);
                }
                else {
                    eval(src);
                }
            }
        }
        
        return module.exports;
    };
    
    $i.clear = function (modId) {
        var module = $i.modules[modId],
            callback = module.loadCallback
        ;
        
        module.loading = false;
        module.loaded = true;
        delete module.loadCallback;
        
        if (callback) {
            callback(module.exports);
        }
    };
    
    INFUSE_MODULES
}());
