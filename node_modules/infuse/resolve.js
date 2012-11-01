
var resolve     = require("resolve"),
    nodePath    = process.env.NODE_PATH,
    nodePaths   = nodePath && nodePath.split(":")
;

module.exports = function (basepath, modulename, paths) {
    var opts = { paths: nodePaths || [] };
    
    if (resolve.isCore(modulename)) {
        opts.paths = paths || [];
        return resolve.sync(modulename + ".js", opts);
    }
    else {
        opts.basedir = basepath;
        opts.paths = paths ? paths.concat(opts.paths) : opts.paths;
        return resolve.sync(modulename, opts);
    }
};
