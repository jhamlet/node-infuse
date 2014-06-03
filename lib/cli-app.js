
var FS          = require("fs"),
    Path        = require("path"),
    existsSync  = FS.existsSync || Path.existsSync,
    resolve     = require("resolve"),
    infuse      = require("./infuse"),
    isArray     = Array.isArray,
    LEADING_DOT = /^\./,
    JS_EXT      = /\.js$/
;
//---------------------------------------------------------------------------
// Utilities
//---------------------------------------------------------------------------
function filterDirectory (filename) {
    return !LEADING_DOT.test(filename) && JS_EXT.test(filename);
}
//---------------------------------------------------------------------------
// Public/Exports
//---------------------------------------------------------------------------
module.exports = {
    
    run: function () {
        var opts      = this.processOptions(),
            infile    = opts.infile || "",
            infusions = isArray(infile) ? infile : [infile],
            outfile   = opts.outfile,
            outpaths  = isArray(outfile) ? outfile : [outfile],
            len       = infusions.length,
            i = 0
        ;
        
        if (!infile && !this.infuseOptions.prefuse) {
            return;
        }
        
        for (i = 0, len = infusions.length; i < len; i++) {
            this.infuse(infusions[i], outpaths[i]);
        }
    },
    
    infuse: function (infile, outfile) {
        var opts       = this.options,
            infuseOpts = this.infuseOptions,
            output     = infuse(infile, infuseOpts)
        ;
        
        if (this.printStdout) {
            process.stdout.write(output);
        }
        else {
            FS.writeFileSync(outfile, output, "utf8");
        }
    },
    
    processOptions: function () {
        var opts = this.options = require("./options");
        
        this.processPaths();
        
        this.infuseOptions = {
            definitions: this.processDefinitions(),
            reserved:    this.processReserved(),
            skipRequires: opts.skipRequires,
            embed:       opts.embed,
            libPaths:    opts.nodeLibPaths,
            nominify:    opts.nominify,
            prefuse:     opts.prefuse,
            dumpAst:     opts.dumpAst,
            dumpPaths:   opts.dumpPaths
        };
        
        return opts;
    },
    
    processPaths: function () {
        var opts    = this.options,
            inFile  = opts.infile,
            outFile = opts.outfile,
            inPaths,
            outPaths,
            outExists,
            outIsDir
        ;
        
        if (!outFile) {
            this.printStdout = true;
            outIsDir = false;
        }
        else {
            outExists = existsSync(outFile);
            outIsDir = outExists && FS.statSync(outFile).isDirectory();
        }
        
        if (inFile) {
            if (!existsSync(inFile)) {
                throw new Error("Can not read from '" + inFile + "'. Path does not exist.");
            }

            if (FS.statSync(inFile).isDirectory()) {
                inPaths = FS.readdirSync(inFile).
                    filter(filterDirectory).
                    map(function (filename) {
                        return Path.join(inFile, filename);
                    });

                if (outIsDir) {
                    opts.infile = inPaths;
                    opts.outfile = inPaths.map(function (path) {
                        return Path.join(outFile, Path.basename(path));
                    });
                }
                else {
                    opts.infile = "";
                    opts.prefuse = opts.prefuse ?
                        opts.prefuse.concat(inPaths) :
                        inPaths;
                }
            }
        }
    },
    
    processDefinitions: function () {
        var opts    = this.options,
            modules = opts.definitionsModule,
            defines = opts.definitions,
            definitions = {}
        ;

        // Require any definition modules
        if (modules) {
            modules = isArray(modules) ? modules : [modules];
            modules.forEach(function (name) {
                var mod = require(resolve.sync(name, { basedir: process.cwd() }));
                Object.keys(mod).forEach(function (k) {
                    definitions[k] = mod[k];
                });
            });
        }

        // Individual definitions
        if (defines) {
            defines = isArray(defines) ? defines : [defines];
            defines.forEach(function (def) {
                var delimIdx = def.indexOf("="),
                    key, val
                ;

                if (~delimIdx) {
                    key = def.slice(0, delimIdx);
                    val = def.slice(delimIdx+1);
                    try {
                        val = JSON.parse(val);
                    }
                    catch (e) {}
                }
                else {
                    key = def;
                    val = true;
                }

                definitions[key] = val;
            });
        }
        
        return definitions;
    },
    
    processReserved: function () {
        var reserved = this.options.reserved;
        
        return reserved ? 
            reserved.reduce(function (t, c) {
                t.push.apply(t, c.split(","));
                return t;
            }, []) :
            [];
    },
    
    log: function () {
        Array.prototype.slice.call(arguments).forEach(function (msg) {
            process.stderr.write(msg + "\n");
        });
    }
    
};
