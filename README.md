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

usage: infuse INPUT_PATH OUPUT_PATH [options]

INPUT_PATH     File or directory to read.
OUPUT_PATH     File or directory to write to. If not specified, write to STDOUT.

options:
   -N, --no-minify               Do not minify the output. Essentially, set `beautify` for
                                 the UglifyJS output.
   -D, --define SYMBOL[=VALUE]   Replace all instances of the specified SYMBOL with VALUE.
                                 If VALUE is not given, SYMBOL will be set to true.
                                 Otherwise, VALUE will be a JSON parsed value, or plain
                                 string. Can be specified multiple times.
   -d, --define-module NAME      Will load the NAMEd module (as per require()) and 'define'
                                 all exported properties. NOTE: if you are requiring a path
                                 relative to the current working directory, be sure to start
                                 your path with a './', just as you would for a node require
                                 statement. Can be specified multiple times.
   -E, --embed                   Embed the infused modules as strings in the final output,
                                 and lazy-evaluate them when required.
   -R, --reserved WORD           A comma-delimited list of reserved words that should NOT be
                                 mangled. Can be specified multiple times.
   -L, --node-lib PATH           PATH to your local directory of node builtin modules. These
                                 are used to resolve requires for 'core' modules (not
                                 suggested). Can be specified multiple times, and each
                                 directory will be tried.
   -i, --infuse PATH             Pre-infuse with PATH. These files will be infused into the
                                 final output and will be automatically 'de-fused' before
                                 the INPUT_PATH executes. Can be specified multiple times.
   -I, --dump-infusions          Print all the paths 'required' by INPUT_PATH (and all other
                                 required files) to STDOUT and exit.
   -A, --dump-ast                Dump out the generated Abstract Syntax Tree and exit.
   -V, --version                 Print the version information and exit.
   -h, --help                    Print this and exit.

NOTES:
In the case of INPUT_PATH being a directory, if OUTPUT_PATH is a directory each file from
INPUT_PATH will be infused and placed in OUTPUT_PATH. If OUTPUT_PATH is a file, all files from
INPUT_PATH will be infused and combined into OUTPUT_PATH. If OUTPUT_PATH is meant to be a
directory, it must exist first.
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


