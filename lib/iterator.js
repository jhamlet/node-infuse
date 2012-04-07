
(function () {
    
    var Proteus = require("proteus"),
        PClass  = Proteus.Class,
        isArray = Array.isArray
    ;
    //-----------------------------------------------------------------------
    // Privates
    //-----------------------------------------------------------------------
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
                if (isArray(node)) {
                    break;
                }
                this.setCurrentIndex(idx);
            }
            
            if (isFwd ? idx > max : idx < max) {
                this.stack.pop();
                this.indices.pop();
                this.setCurrentIndex(this.getCurrentIndex() + dir);
                crawl.call(this, dir);
            }
            else {
                this.stack.push(node);
                this.indices.push(isFwd ? 0 : node.length - 1);
            }
        }
        
        return this;
    }
    //-----------------------------------------------------------------------
    // Public/Exports
    //-----------------------------------------------------------------------
    module.exports.DFIterator = PClass.derive({
        
        init: function (ast, opts) {
            this.setSubject(ast);
            this.options = Proteus.merge({}, this.options, opts || {});
        },
        
        options: {
            // TBD
        },
        //-------------------------------------------------------------------
        // Iteration
        //-------------------------------------------------------------------
        start: function () {
            this.reset();
            this.stack.push(this.subject);
            this.indices.push(0);
        },
        
        next: function () {
            crawl.call(this, 1);
            return this;
        },
        
        previous: function () {
            crawl.call(this, -1);
            return this;
        },
        
        skipTo: function (name) {
            var node;
            do {
                crawl.call(this, 1);
                node = this.getCurrent();
            } while (node && node[0] !== name);
            return this;
        },
        
        rewindTo: function (name) {
            var node;
            do {
                crawl.call(this, -1);
                node = this.getCurrent();
            } while (node && node[0] !== name);
            return this;
        },
        //-------------------------------------------------------------------
        // State
        //-------------------------------------------------------------------
        getCurrent: function () {
            var stack = this.stack,
                current = stack[stack.length-1]
            ;
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
    
}());