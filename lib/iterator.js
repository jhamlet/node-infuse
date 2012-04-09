
(function (exports) {
    
    var Proteus  = require("proteus"),
        PClass   = Proteus.Class,
        isArray  = Array.isArray
    ;
    //-----------------------------------------------------------------------
    // Privates
    //-----------------------------------------------------------------------
    function push (node, idx) {
        this.stack.push(node);
        this.indices.push(idx);
    }
    
    function pop (delta) {
        this.stack.pop();
        this.indices.pop();
        this.setCurrentIndex(this.getCurrentIndex() + delta);
    }

    function crawl (dir) {
        var current = this.getCurrent(),
            idx = this.getCurrentIndex(),
            isFwd = dir > 0,
            node,
            max
        ;
        
        if (current) {
            max = isFwd ? current.length-1 : 0;
            for (; isFwd ? idx <= max : idx >= max ; idx += dir) {
                node = current[idx];
                this.setCurrentIndex(idx);
                if (isArray(node)) {
                    break;
                }
            }
            
            if (isFwd ? idx > max : idx < max) {
                pop.call(this, dir);
                crawl.call(this, dir);
            }
            else {
                push.call(this, node, isFwd ? 0 : node.length - 1);
            }
        }
        
        return this;
    }
    
    function crawlTo (pattern, dir) {
        var node;
        
        pattern = typeof pattern === "string" ? new RegExp(pattern) : pattern;
        
        do {
            crawl.call(this, dir);
            node = this.getCurrent();
        } while (node && !pattern.test(node.name));
    }
    //-----------------------------------------------------------------------
    // Public/Exports
    //-----------------------------------------------------------------------
    module.exports = PClass.derive({
        
        init: function (ast, opts) {
            this.setSubject(ast);
            this.options = Proteus.merge({}, this.options, opts || {});
            this.start();
        },
        
        options: {
            // TBD
        },
        //-------------------------------------------------------------------
        // Iteration
        //-------------------------------------------------------------------
        start: function () {
            this.reset();
            push.call(this, this.subject, 0);
        },
        
        next: function () {
            crawl.call(this, 1);
            return this;
        },
        
        rewind: function () {
            crawl.call(this, -1);
            return this;
        },
        
        skipTo: function (name) {
            crawlTo.call(this, name, 1);
            return this;
        },
        
        rewindTo: function (name) {
            crawlTo.call(this, name, -1);
            return this;
        },
        //-------------------------------------------------------------------
        // 
        //-------------------------------------------------------------------
        getParent: function (child) {
            var stack = this.stack,
                i = stack.length
            ;
            
            while (i--) {
                if (stack[i] === child) {
                    i--;
                    break;
                }
            }
            
            return stack[i];
        },
        //-------------------------------------------------------------------
        // State
        //-------------------------------------------------------------------
        hasTerminated: function () {
            return !this.stack || !this.stack.length;
        },
        
        getCurrent: function () {
            var stack = this.stack,
                current = stack[stack.length-1]
            ;
            
            if (current && !current.name && typeof current[0] === "string") {
                Object.defineProperty(current, "name", {
                    value: current[0],
                    configurable: true,
                    writable: true
                });
            }
            
            return current;
        },
        
        getCurrentIndex: function () {
            var indices = this.indices;
            return indices[indices.length-1];
        },
        
        setCurrentIndex: function (idx) {
            var indices = this.indices;
            indices[indices.length-1] = idx;
            return this;
        },
        
        setSubject: function (ast) {
            this.subject = ast;
            this.reset();
            return this;
        },
        
        getSubject: function () {
            return this.subject;
        },
        
        reset: function () {
            (this.stack || (this.stack = [])).length = 0;
            (this.indices || (this.indices = [])).length = 0;
            return this;
        }
        
    });
    
}(module.exports));
