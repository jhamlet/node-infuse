
var FS          = require("fs"),
    Path        = require("path"),
    infuse      = require("./infuse"),
    isArray     = Array.isArray
;
//---------------------------------------------------------------------------
// Public/Exports
//---------------------------------------------------------------------------
module.exports = {
    
    run: function () {
        var opts = this.processOptions();
        
        if (opts.watchFile) {
            opts.force = true;
            this.watch();
        }
        else {
            this.infuse(opts.infile);
        }
    },
    
    infuse: function (input) {
        var opts = this.options,
            infuseOpts = this.infuseOptions,
            output = infuse(input, infuseOpts)
        ;
        
        if (this.printStdout) {
            process.stdout.setEncoding("utf8");
            process.stdout.write(output);
        }
        else {
            FS.writeFileSync(opts.outfile, output, "utf8");
        }
    },
    
    processOptions: function () {
        var opts = this.options = require("./options");
        
        this.processPaths();
        
        this.infuseOptions = {
            definitions: this.processDefinitions(),
            reserved:    this.processReserved(),
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
            outFile = opts.outfile
        ;
        
        if (!outFile) {
            this.printStdout = true;
        }
        else {
            if (Path.existsSync(outFile) && !opts.force) {
                throw "Can not write to '" + outFile + "'. " +
                    "File already exists. Use -F, --force to overwrite.";
            }
        }
        
        if (!Path.existsSync(inFile)) {
            throw "Can not read from '" + inFile + "'. File does not exist.";
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
                var mod;
                name = name.indexOf(".") === 0 ?
                    Path.join(process.cwd(), name) :
                    name;
                mod = require(name);
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
