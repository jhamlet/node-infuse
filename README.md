Infuse
======

> Mainline your node JavaScript


Summary
-------

**infuse** bundles up your node JavaScript files by following the `require("moduleName")` statements in your source file, and then bundles it all up into one JavaScript file.

In addition, by utilizing [`uglify-js`'](https://github.com/mishoo/UglifyJS) ability to remove dead code, you can have **infuse** act as a pre-processor of sorts on your combined file when using the `--define` and `--define-module` options.


Installation
------------

    % npm install -g infuse
    

Command Line Usage
------------------

    % infuse -h
    
    usage: infuse [INPUT_PATH] [OUPUT_PATH] [options]
    
    [INPUT_PATH]     File to read. If not specified, read from STDIN.
    [OUPUT_PATH]     File to write. If not specified, write to STDOUT.
    
    options:
       -L, --node-lib PATH           PATH to your local library directory of node builtin modules.
       -N, --no-minify               Do not minify the output.
       -F, --force                   If OUTPUT_PATH already exists, overwrite it.
       -D, --define SYMBOL[=VALUE]   Replace all instances of the specified SYMBOL with VALUE.
       -d, --define-module NAME      Will load the NAMEd module (as per require()) and 'define' all exported properties.
       -R, --reserved WORD           A comma-delimited list of reserved words that should NOT be mangled.
       -V, --version                 Print the version information and exit.
       -h, --help                    Print this.
   
    NOTE ON RETURN VALUES FROM --define's: 
       Currently in UglifyJS, the return value of defines have to be in the 
       form of the AST. i.e: ["num", "9"].
       
       Value references:
                true: ["name", "true"]
               false: ["name", "false"]
           undefined: ["name", "undefined"]
              string: ["string", "foo"]
              number: ["num", "9"]


Dependencies
------------

    uglify-js  >= 1.2.x
    nomnom     >= 1.5.x
    proteus    >= 0.0.x


More?
-----

Future plans are to have **infuse** allow you to post-process your JavaScript and manipulate the underlying _Abstract Syntax Tree_. This will allow _macros_, _replacements_, and more...
