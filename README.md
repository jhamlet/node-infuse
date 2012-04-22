Infuse
======

> Mainline your node JavaScript


Summary
-------

**infuse** bundles up your node JavaScript files by following the `require("moduleName")` statements in your source file, and then bundles it all up, and _uglifies_ (minimizes) it into one JavaScript file.

In addition, by utilizing [`uglify-js`'](https://github.com/mishoo/UglifyJS) ability to remove dead code, you can have **infuse** act as a pre-processor of sorts on your combined file when using the `--define` and `--define-module` options.


Installation
------------

~~~
% npm install -g infuse
~~~


Command Line Usage
------------------

~~~
% infuse -h

usage: infuse INPUT_PATH [OUPUT_PATH] [options]

INPUT_PATH     File to read.
[OUPUT_PATH]     File to write. If not specified, write to STDOUT.

options:
   -L, --node-lib PATH           PATH to your local library directory of node builtin
                                 modules.
                                 
   -N, --no-minify               Do not minify the output.
                                 
   -F, --force                   If OUTPUT_PATH already exists, overwrite it.
                                 
   -D, --define SYMBOL[=VALUE]   Replace all instances of the specified SYMBOL with VALUE.
                                 
   -d, --define-module NAME      Will load the NAMEd module (as per require()) and 'define'
                                 all exported properties.
                                 
   -E, --embed                   Embed the infused modules as strings and lazy-evaluate them
                                 when required.
                                 
   -R, --reserved WORD           A comma-delimited list of reserved words that should NOT be
                                 mangled.
                                 
   -S, --stdin                   Read INPUT_FILE from STDIN instead of a file. The current
                                 working directory will be considerd the base directory for
                                 resolving requires.
                                 
   -w, --watch                   Watch INPUT_FILE. Whenever it is modified, re-infuse with
                                 the same command.
                                 
   -i, --infuse PATH             Pre-infuse with PATH. These files will be included in the
                                 infusions and will be automatically 'required' before the
                                 INPUT_FILE executes.
                                 
   -I, --dump-infusions          Print all the paths 'required' by INPUT_PATH (and those it
                                 requires) to STDOUT and exit.
                                 
   -A, --dump-ast                Dump out the generated Abstract Syntax Tree and exit.
                                 
   -V, --version                 Print the version information and exit.
                                 
   -h, --help                    Print this and exit.
                                 
~~~


### Dependencies ###

~~~
proteus:   >=0.0.x
nomnom:    >=1.5.x
uglify-js: >=1.2.x
wordwrap:  >=0.0.2
~~~


Defines
-------

**infuse** now processes all `defines` itself, and the values returned from `defines` are translated into the appropriate AST structure. No need for your `define/define-module` to return an AST formatted array.

By having **infuse** handle the `defines` in the pre-mangled/squeezed AST, if you supply the `--no-minify` flag to **infuse** you can see the _beautified_ `uglify-js` generated output without any dead-code being removed (this is helpful when reviewing what your defines are returning/generating).


Embedding
---------

The **infuse** `-E, --embed` option will _infuse_ required modules as `strings` and lazy-evaluate them when used in the final script. In the case of a browser, this means appending a script element to the `head` of the document temporarily. In other cases, **infuse** goes to the _dark side_ and uses `eval`.

The **advantage** of embedding is that the required JavaScript modules are not evaluated until the strings are put into a script node, or `eval`'d, when needed. This facilitates faster loading of the _infused_ JavaScript file, since it is, mostly, one large string.


Examples
--------

### Defines ###

~~~js
// contents my-defines.js

var env = process.env.ENVIRONMENT || "dev",
    tokens = {
        appName: "My Great WebApp",
        authorName: "Me"
    },
    isDebug = env === "dev"
;

module.exports = {
    ENVIRONMENT: env,
    DEBUG: isDebug,
    TOKEN: function (key) {
        return tokens[key];
    },
    MY_METHOD: function () {
        return isDebug ?
            function () {
                return "is debug";
            } :
            function () {
                return "is not debug";
            }
    },
    CONFIG: {
        foo: "foo",
        baz: [1, 2, 3],
        doSomething: function () {
            return "something";
        },
        isDebug: isDebug
    }
};

// contents of my-script.js

var appConfig   = CONFIG;

if (ENVIRONMENT === "dev") {
    console.log("A note to the developer...");
}

function MyClass () {}

MyClass.prototype = {
    appName: TOKEN("appName"),
    authorName: TOKEN("authorName"),
    
    specialMethod: MY_METHOD(),
};
~~~

And I run `infuse my-script.js script.js -d ./my-defines.js -N` (assuming I have ENVIRONMENT set to `dev`) I would get the following:

~~~js
var appConfig = {
    foo: "foo",
    baz: [ 1, 2, 3 ],
    doSomething: function() {
        return "something";
    },
    isDebug: true
};

if ("dev" === "dev") {
    console.log("A note to the developer...");
}

function MyClass() {}

MyClass.prototype = {
    appName: "My Great WebApp",
    authorName: "Me",
    specialMethod: function() {
        return "is debug";
    }
};
~~~

And the minified result (`infuse my-script.js script.js -d ./my-defines.js`) would be:

~~~js
function b(){}var a={foo:"foo",baz:[1,2,3],doSomething:function(){return"something"},isDebug:true};console.log("A note to the developer..."),b.prototype={appName:"My Great WebApp",authorName:"Me",specialMethod:function(){return"is debug"}}
~~~

Note how the `if` block was removed around the `console.log` statement, since this is `dev` mode. If `ENVIRONMENT` was set to some other value, `console.log` would be removed too.

There are more examples in the "examples" directory. Install the development dependencies, and then run:

~~~
sake examples ENVIRONMENT=[dev|prod] BUILD_TYPE=[debug|release]
~~~


More?
-----

Future plans are to have **infuse** allow you to post-process your JavaScript and manipulate the underlying _Abstract Syntax Tree_. This will allow _macros_, _replacements_, and more...


