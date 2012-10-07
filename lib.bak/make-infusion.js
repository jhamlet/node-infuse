//---------------------------------------------------------------------------
// Embedded infusion
//---------------------------------------------------------------------------
// (function () {
//     var module = __infuse__.modules[MODULE_ID],
//         exports = module.exports
//     ;
//     
//     MODULE;
//     
//     __infuse__.clear(MODULE_ID)
// }());
//---------------------------------------------------------------------------
// Standard Infusion
//---------------------------------------------------------------------------
// function __infusion__ () {
//     var module = __infuse__.modules[MODULE_ID],
//         exports = module.exports
//     ;
//     
//     MODULE
//     
//     __infuse__.clear(MODULE_ID)
// };

function makeFunction (id, ast) {
    var fn = [ "function", null, [], [] ],
        stats = fn[3]
    ;
    
    stats.push([ "var",
          [ [ "module",
              [ "sub",
                [ "dot", [ "name", "__infuse__" ], "modules" ],
                [ "num", id ] ] ],
            [ "exports", [ "dot", [ "name", "module" ], "exports" ] ] ] ]
    );
    
    stats.splice.apply(stats, [1, 0].concat(ast));
    
    stats.push([ "stat",
          [ "call",
              [ "dot", [ "name", "__infuse__" ], "clear" ],
              [ [ "num", id ] ] ] ]
    );
    
    return fn;
}

module.exports = function (id, ast, embed) {
    var fn = makeFunction(id, ast);
    return embed ? ["call", fn] : fn;
};