
var Path = require("path"),
    resolve = require.resolve
;

function fromRelative (path, name) {
    try {
        return resolve(Path.join(path, name));
    }
    catch (e) {}
    
    return false;
}

function fromNodeModules (start, name) {
    var subpath = Path.join("node_modules", name),
        path
    ;
    
    do {
        if ((path = fromRelative(start, subpath))) {
            return path;
        }
        start = start.split("/").slice(0, -1).join("/") || "/";
    } while (start !== "/");
    
    return false;
}

function fromNodeLib (libPaths, name) {
    var path, libpath;
    
    function testLib (lib) {
        if ((path = fromRelative(lib, name)) ||
            (path = fromRelative(lib, libpath))
        ) {
            return true;
        }
    }
    
    if (!libPaths || libPaths.length < 1) {
        return false;
    }
    
    libpath = Path.join("lib", name);
    
    if (libPaths.some(testLib)) {
        return path;
    }
    
    return false;
}

function resolveFrom (currentPath, moduleName, libPaths) {
    var path;
    
    try {
        if (!(/^\./.test(moduleName)) && !~moduleName.indexOf("/")) {
            if (path = fromNodeLib(libPaths, moduleName)) {
                return path;
            }
            else if (moduleName === resolve(moduleName)) {
                throw new Error(
                    "Can not resolve node builtin module path '" + moduleName +
                    "' without -L, or --node-lib, option set.")
            }
        }
        // see if Node will do the work for us...
        return resolve(moduleName);
    }
    catch (err) {
        // is it relative to the current path?
        if ((path = fromRelative(currentPath, moduleName)) ||
        // or, is it somewhere in a node_modules directory
            (path = fromNodeModules(currentPath, moduleName))
        ) {
            return path;
        }
        else {
            throw new Error(err.message);
        }
    }
}

module.exports.resolveFrom            = resolveFrom;
module.exports.resolveFromRelative    = fromRelative;
module.exports.resolveFromNodeModules = fromNodeModules;
module.exports.rsolveFromNodeLib      = fromNodeLib;
