
var Proteus = require("proteus"),
    Infusions
;

module.exports = Infusions = Proteus.Class.derive({
    
    init: function (opts) {
        opts = this.options = Proteus.merge({}, this.options, opts || {});
        this.items = [];
        this.pathMap = {};
    },
    
    options: {},
    
    has: function (path) {
        return this.pathMap.hasOwnProperty(path);
    },
    
    add: function (path, infused) {
        var items = this.items,
            id
        ;
        
        items.push(infused);
        id = items.length - 1;
        this.pathMap[path] = id;
        
        items[id].infuse(path);
        
        return id;
    },
    
    getId: function (path) {
        return this.pathMap[path];
    }
});