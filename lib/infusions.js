
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
    
    add: function (infused) {
        var id;
        
        this.items.push(infused);
        id = this.items.length - 1;
        
        this.pathMap[infused.filepath] = id;
        
        return id;
    },
    
    getId: function (path) {
        return this.pathMap[path];
    }
});