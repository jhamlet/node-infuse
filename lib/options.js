
var FS      = require("fs"),
    Path    = require("path"),
    pkgPath = Path.join(__dirname, "..", "package.json"),
    pkgInfo = JSON.parse(FS.readFileSync(pkgPath, "utf8")),
    wordwrap = require("wordwrap")
;
//---------------------------------------------------------------------------
// Utilities
//---------------------------------------------------------------------------
function formatHelp (options) {
    var helpW = 60,
        wrap =  wordwrap(helpW),
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
            opt.help = wrap(opt.help);
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
            help: "File or directory to read."
        },
    
        outfile: {
            string: "OUTPUT_PATH",
            position: 1,
            help: "File or directory to write to. If not specified, write to STDOUT."
        },
    
        nominify: {
            string: "-N, --no-minify",
            flag: true,
            help: "Do not minify the output. Essentially, set `beautify` for the UglifyJS output."
        },
    
        definitions: {
            string: "-D, --define SYMBOL[=VALUE]",
            help: "Replace all instances of the specified SYMBOL with VALUE. If VALUE is not given, SYMBOL will be set to true. Otherwise, VALUE will be a JSON parsed value, or plain string. Can be specified multiple times.",
            list: true
        },
    
        definitionsModule: {
            string: "-d, --define-module NAME",
            help: "Will load the NAMEd module (as per require()) and 'define' all exported properties. Can be specified multiple times.",
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
    
        prefuse: {
            string: "-i, --infuse PATH",
            help: "Pre-infuse with PATH. These files will be infused into the final output and will be automatically 'de-fused' before the INPUT_PATH executes. Can be specified multiple times.",
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
    help(wordwrap(100)("NOTES:\nIf OUTPUT_PATH is a directory then each file from INPUT_PATH will be infused and placed in OUTPUT_PATH. If not a directory OUTPUT_PATH is assumed to be a file, and all files from INPUT_PATH will be infused and combined into OUTPUT_PATH (as '-i, --infuse').")).
    parse();
