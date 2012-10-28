/*globals suite, test */

var Selector = require("infuse/ast/query/selector"),
    Ast      = require("infuse/ast"),
    source   = "var foo = 'foo'; function baz (arg) { return arg; }; console.log(baz(foo));",
    ast      = new Ast({ source: source })
;

// console.log(JSON.stringify(ast, null, 4));

suite("QuerySelector", function () {

    test("Comparison strategies", function () {
        var comps = Selector.COMPARISONS;
        
        comps["="]("foo", "foo").should.equal(true);
        comps["="]("foo", "baz").should.equal(false);
        comps
        comps["^="]("foo-baz", "foo").should.equal(true);
        comps["^="]("foo-baz", "baz").should.equal(false);
        comps
        comps["$="]("foo-baz", "baz").should.equal(true);
        comps["$="]("foo-baz", "foo").should.equal(false);
        comps
        comps["~="]("foo baz", "baz").should.equal(true);
        comps["~="]("foo baz", "foo").should.equal(true);
        comps["~="]("foo baz", "bar").should.equal(false);
        comps
        comps["*="]("foo baz", "baz").should.equal(true);
        comps["*="]("foo baz", "foo").should.equal(true);
        comps["*="]("foo baz", "bar").should.equal(false);
        comps
        comps["|="]("foo-baz", "baz").should.equal(false);
        comps["|="]("foo-baz", "foo").should.equal(true);
        comps["|="]("foo-baz", "bar").should.equal(false);
        comps
        comps["|="]("foo-baz-bar", "foo").should.equal(true);
        comps["|="]("foo-baz-bar", "baz").should.equal(true);
        comps["|="]("foo-baz-bar", "bar").should.equal(false);
        comps["|="]("foo-baz-bar", "fuz").should.equal(false);
    });
    
    test("Test Strategies", function () {
        var tests = Selector.TESTS,
            subj
        ;
        
        subj = ast.subject;
        tests.self(subj, "type", "=", "Program").should.equal(true);
        tests.self(subj, "type", "=", "*").should.equal(true);
        
        subj = ast.subject.body[0];
        tests.parent(subj, "type", "=", "Program").should.equal(ast.subject);
        tests.parent(subj, "type", "=", "*").should.equal(ast.subject);
        
        subj = ast.subject.body[1].body.body[0];
        tests.ancestor(subj, "type", "=", "Program").should.equal(ast.subject);
        tests.parent(subj, "type", "=", "BlockStatement").should.equal(subj.parent);
    });
    
    test("Test selector#test", function () {
        var subj, sel;
        
        subj = ast.subject;
        sel = new Selector("type", "=", "Program");
        sel.test(subj).should.equal(true)
        sel = new Selector("type");
        sel.test(subj).should.equal(true)
        
        subj = ast.subject.body[0];
        sel = new Selector("type", "=", "Program");
        sel.type = Selector.TYPES.PARENT;
        sel.test(subj).should.equal(ast.subject);
        sel = new Selector("type");
        sel.type = Selector.TYPES.PARENT;
        sel.test(subj).should.equal(ast.subject);
        
        subj = ast.subject.body[1].body.body[0];
        sel = new Selector("type", "=", "Program");
        sel.type = Selector.TYPES.ANCESTOR;
        sel.test(subj).should.equal(ast.subject);
        sel = new Selector("type", "=", "BlockStatement");
        sel.type = Selector.TYPES.PARENT;
        sel.test(subj).should.equal(subj.parent);
    });
});