
var FS      = require("fs"),
    Path    = require("path"),
    pkgPath = Path.join(__dirname, "..", "package.json"),
    pkgInfo = JSON.parse(FS.readFileSync(pkgPath, "utf8"))
;
//---------------------------------------------------------------------------
// Utilities
//---------------------------------------------------------------------------
function formatHelp (options) {
    var helpW = 60,
        wordwrap =  require("wordwrap")(helpW),
        optCols,
        pad
    ;
    
    optCols = Object.keys(options).reduce(function (t, key) {
        var optW = options[key].string.length;
        return optW > t ? optW : t;
    }, 0);
    
    pad = optCols + 7;
    
    Object.keys(options).forEach(function (key) {
        var opt = options[key];
        if (!opt.hasOwnProperty("position")) {
            opt.help = wordwrap(opt.help); // + "\n";
            opt.help = opt.help.replace(/\n/g, "\n" + Array(pad).join(" "));
        }
    });
    
    return options;
}
//---------------------------------------------------------------------------
// Exports/Options
//---------------------------------------------------------------------------
module.exports = require("nomnom").
    script("infuse").
    options(formatHelp({
        infile: {
            string: "INPUT_PATH",
            position: 0,
            help: "File to read."
        },
    
        outfile: {
            string: "OUPUT_PATH",
            position: 1,
            help: "File to write. If not specified, write to STDOUT."
        },
    
        nominify: {
            string: "-N, --no-minify",
            flag: true,
            help: "Do not minify the output. Essentially, set `beautify` for the UglifyJS output."
        },
    
        force: {
            string: "-F, --force",
            flag: true,
            help: "If OUTPUT_PATH already exists, overwrite it."
        },
    
        definitions: {
            string: "-D, --define SYMBOL[=VALUE]",
            help: "Replace all instances of the specified SYMBOL with VALUE. If VALUE is not given, that evaluates to SYMBOL=true. Otherwise, VALUE will be JSON parsed, and if that fails, it will be used as a plain string. Can be specified multiple times.",
            list: true
        },
    
        definitionsModule: {
            string: "-d, --define-module NAME",
            help: "Will load the NAMEd module (as per require()) and 'define' all exported properties. Note: if you are requiring a path relative to the current working directory, be sure to start your path with a './', just as you would for a node require statement. Can be specified multiple times.",
            list: true
        },
    
        embed: {
            string: "-E, --embed",
            help: "Embed the infused modules as strings in the final output, and lazy-evaluate them when required.",
            flag: true
        },
    
        reserved: {
            string: "-R, --reserved WORD",
            help: "A comma-delimited list of reserved words that should NOT be mangled. Can be specified multiple times.",
            list: true
        },
    
        nodeLibPaths: {
            string: "-L, --node-lib PATH",
            list: true,
            help: "PATH to your local directory of node builtin modules. These are used to resolve requires for 'core' modules (not suggested). Can be specified multiple times, and each directory will be tried."
        },
    
        // readStdin: {
        //     string: "-S, --stdin",
        //     help: "Read INPUT_FILE from STDIN instead of a file. The current working directory will be considerd the base directory for resolving requires of the './' variety.",
        //     flag: true
        // },
    
        // watchFile: {
        //     string: "-w, --watch",
        //     help: "Watch INPUT_FILE and any --define-module files. Whenever they are modified, re-infuse with the same command. Implies --force.",
        //     flag: true
        // },
    
        prefuse: {
            string: "-i, --infuse PATH",
            help: "Pre-infuse with PATH. These files will be infused into the final output and will be automatically 'de-fused' before the INPUT_FILE executes. Can be specified multiple times.",
            list: true
        },
    
        dumpPaths: {
            string: "-I, --dump-infusions",
            help: "Print all the paths 'required' by INPUT_PATH (and all other required files) to STDOUT and exit.",
            flag: true
        },
    
        dumpAst: {
            string: "-A, --dump-ast",
            help: "Dump out the generated Abstract Syntax Tree and exit.",
            flag: true
        },
    
        version: {
            string: "-V, --version",
            help: "Print the version information and exit.",
            flag: true,
            callback: function () {
                return "version " + pkgInfo.version;
            }
        },
    
        help: {
            string: "-h, --help",
            help: "Print this and exit.",
            flag: true
        }
    })).
    parse();
