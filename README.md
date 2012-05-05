Infuse
======

> Mainline your node JavaScript for universal consumption.


Summary
-------

**Infuse** bundles up your _node_ JavaScript files by following the `require("moduleName")` statements in your source file(s), and then bundles it all up, and _uglifies_ (minimizes) it into one JavaScript file.

In addition, **infuse** can replace symbols found in the source file with JavaScript values _defined_ either with command line arguments, or through the use of another _node_ module.

Coupled with [`uglify-js`'](https://github.com/mishoo/UglifyJS) ability to remove dead code, **infuse** acts as a pre-processor of sorts on your _uglified_ file when using the `--define` and `--define-module` options.


Installation
------------

~~~
% npm install -g infuse
~~~


Command Line Usage
------------------

~~~
% infuse -h

usage: infuse INPUT_PATH OUTPUT_PATH [options]

INPUT_PATH     File or directory to read.
OUTPUT_PATH     File or directory to write to. If not specified, write to STDOUT.

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
If OUTPUT_PATH is a directory then each file from INPUT_PATH will be infused and placed in
OUTPUT_PATH. If not a directory OUTPUT_PATH is assumed to be a file, and all files from INPUT_PATH
will be infused and combined into OUTPUT_PATH (as '-i, --infuse').
~~~


### Dependencies ###

These are installed when **infuse** is installed.

~~~
uglify-js: >=1.2.x
nomnom:    >=1.5.x
resolve:   >=0.2.x
proteus:   >=0.0.x
wordwrap:  >=0.0.2
~~~


### Development Dependencies ###

Installed when you run `npm link` in the package directory.

~~~
mocha:      >=0.3.x
should:     >=0.5.x
sake:       >=0.0.x
underscore: >=1.3.x
~~~


Defines
-------

**Infuse** now processes all `defines` itself, and the values returned from `defines` are translated into the appropriate AST structure. No need for your `define/define-module` to return an AST formatted array.

By having **infuse** handle the `defines` in the pre-mangled/squeezed AST, if you supply the `--no-minify` flag to **infuse** you can see the _beautified_ `uglify-js` generated output without any dead-code being removed (this is helpful when reviewing what your defines are returning/generating).


### Example ###

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

Running `infuse my-script.js script.js -d ./my-defines.js -N` (assuming `ENVIRONMENT` is set to "dev") the following would be produced:

~~~js
// contents of script.js

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
// contents of script.js
function b(){}var a={foo:"foo",baz:[1,2,3],doSomething:function(){return"something"},isDebug:true};console.log("A note to the developer..."),b.prototype={appName:"My Great WebApp",authorName:"Me",specialMethod:function(){return"is debug"}}
~~~

Note how the `if` block was removed around the `console.log` statement, since this is "dev" mode. If `ENVIRONMENT` was set to some other value, `console.log` would be removed too.

There are more examples in the "examples" directory. Install the development dependencies, and then run:

~~~
sake examples ENVIRONMENT=[dev|prod] BUILD_TYPE=[debug|release]
~~~


Embedding
---------

The **infuse** `-E, --embed` option will _infuse_ required modules as `strings` and lazy-evaluate them when used in the final script. In the case of a browser, this means appending a script element to the `head` of the document temporarily. In other cases, **infuse** goes to the _dark side_ and uses `eval`.

The **advantage** of embedding is that the required JavaScript modules are not evaluated until the strings are put into a script node, or `eval`'d, when needed. This facilitates faster loading of the _infused_ JavaScript file, since it is, mostly, one large string.


A Poor Man's Minifier
---------------------

You can get started quickly with **infuse** by using the `-i, --infuse PATH` option:

~~~
infuse -i path/one.js -i path/two.js -i path/three.js > compiled.js
~~~

This basically **infuses** up the individual files and automatically _de-fuses_ them when the compiled script runs.


Caveats
-------

### Run-time variables ###

Currently, **infuse** does not compute local variables, and can not determine require statements with variables defined at run-time.

For example, this **will not** work, and **infuse** will throw an error:

~~~
// script.js

var pkgModule = require("./" + process.env.ENVIRONMENT + "-pkg.js");
~~~

This will however:

~~~
// script.js infused with `--define PKG=prod-pkg.js`

var pkgModule = require(PKG);
~~~


### Global scope leakage ###

Since **infuse** does not do any computing of local variables, it can not determine if variables leak outside of a required module's scope. In _node_ this is not so much a problem, since each module is run in it's own context and only the items explicitly exported through `module.exports` are exposed. **Infuse** uses an anonymous function to simulate what _node_ does, however if the **infused** module doesn't locally scope a variable with the `var` keyword, that variable will be set on the _global object_ (usually the window).


In the future, plans are to resolve the _caveats_ with more introspection of the AST parsed by _UglifyJS_. Stay tuned.


Report an Issue
---------------

* [Bugs](http://github.com/jhamlet/node-infuse/issues)
* Contact the author: <jhamlet@hamletink.com>


License
-------

> Copyright (c) 2012 Jerry Hamlet <jerry@hamletink.com>
> 
> Permission is hereby granted, free of charge, to any person
> obtaining a copy of this software and associated documentation
> files (the "Software"), to deal in the Software without
> restriction, including without limitation the rights to use,
> copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the
> Software is furnished to do so, subject to the following
> conditions:
> 
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
> 
> The Software shall be used for Good, not Evil.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
> OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
> HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
> WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
> FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
> OTHER DEALINGS IN THE SOFTWARE.
