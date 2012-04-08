Infuse
======

> Mainline your node JavaScript

Summary
-------

**infuse** allows you to post-process your JavaScript and manipulate the underlying _Abstract Syntax Tree_. This allows you do _macros_, _replacements_, and more.


Installation
------------

    % npm install -g infuse

Dependencies
------------

    proteus   >= 0.0.x
    nomnom    >= 1.5.x
    uglify-js >= 1.2.x

Command Line Usage
------------------

    usage: infuse [INPUT_PATH] [OUPUT_PATH] [options]

    [INPUT_PATH]     file to read from. If not specified, will read from STDIN.
    [OUPUT_PATH]     file to write to. If not specified, will write to STDOUT.

    options:
       -L PATH, --node-lib PATH                     PATH to your local library directory of node builtin modules.
       -N, --no-minify                              Do not minify the output.
       -F, --force                                  If OUTPUT_PATH already exists, overwrite it.
       -D SYMBOL[=VALUE], --define SYMBOL[=VALUE]   Replace all instances of the specified SYMBOL with VALUE.
       -d, --definition-module NAME                 Will load the NAMEd module (as per require()) and 'define' all exported properties.
       -R WORD, --reserved WORD                     A comma-delimited list of reserved words that should NOT be mangled.
       -V, --version                                Print the version information and exit.
       -h, --help                                   Print this.

