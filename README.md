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

  Usage: infuse [options] &lt;INPUT_PATH&gt; [OUTPUT_PATH]

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -c, --comments                 preserve comments in the source files
    -D, --define &lt;SYMBOL&gt;[=VALUE]  replace the specified SYMBOL(s) with VALUE [*]
    -d, --definitions &lt;NAME&gt;       replace all exported properties from NAME module [*]
    -A, --dump-ast                 output the JSON for the generated AST
    -M, --dump-modules             output the list of the required modules
    -e, --embed                    embed all required modules as strings
    -i, --infusion &lt;NAME&gt;          add NAME module as an infusion [*]
    -m, --minify [NAME]            minify output using NAME minifier ['uglify']
    -n, --nodelib &lt;PATH&gt;           path to the local node core modules directory [*]
    -p, --pre-process &lt;NAME&gt;       run the INPUT_PATH through NAME processor before infusing [*]
    -r, --require &lt;NAME&gt;           include NAME module as an automatic require [*]
    -R, --no-requires              do not process require statements

  Additional Usage Information:

    [*]   option can be specified multiple times
~~~


### Dependencies ###

These are installed when **infuse** is installed.

~~~
esprima:   =1.0.x
escodegen: =0.0.x
commander: =1.1.x
resolve:   =0.2.x
proteus:   =0.1.x
~~~


### Development Dependencies ###

Installed when you run `npm link` in the package directory.

~~~
mocha:  =1.7.x
should: =1.2.x
sake:   =0.1.x
ejs:    =0.8.x
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

&gt; Copyright (c) 2012 Jerry Hamlet &lt;jerry@hamletink.com&gt;
&gt; 
&gt; Permission is hereby granted, free of charge, to any person
&gt; obtaining a copy of this software and associated documentation
&gt; files (the &quot;Software&quot;), to deal in the Software without
&gt; restriction, including without limitation the rights to use,
&gt; copy, modify, merge, publish, distribute, sublicense, and/or sell
&gt; copies of the Software, and to permit persons to whom the
&gt; Software is furnished to do so, subject to the following
&gt; conditions:
&gt; 
&gt; The above copyright notice and this permission notice shall be
&gt; included in all copies or substantial portions of the Software.
&gt; 
&gt; The Software shall be used for Good, not Evil.
&gt; 
&gt; THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND,
&gt; EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
&gt; OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
&gt; NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
&gt; HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
&gt; WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
&gt; FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
&gt; OTHER DEALINGS IN THE SOFTWARE.
