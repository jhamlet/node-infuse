/*globals suite, test */

var QueryParser = require("infuse/ast/query/parser"),
    Selector    = require("infuse/ast/query/selector"),
    StrScanner  = require("pstrscan")
;

suite("QueryParser", function () {
    
    test("Parse Type Selector", function () {
        var sel = QueryParser.parseTypeSelector(new StrScanner("Identifier"));
        sel.attribute.should.equal("type");
        sel.comparator.should.equal("=");
        sel.value.should.equal("Identifier");
    });
    
    test("Parse Attribute Selector", function () {
        var sel;
        
        sel = QueryParser.parseAttrSelector(new StrScanner("[name='require']"));
        
        sel.attribute.should.equal("name");
        sel.comparator.should.equal("=");
        sel.value.should.equal("require");

        sel = QueryParser.parseAttrSelector(new StrScanner("[name=\"require\"]"));
        
        sel.attribute.should.equal("name");
        sel.comparator.should.equal("=");
        sel.value.should.equal("require");
        
        sel = QueryParser.parseAttrSelector(new StrScanner("[name = 'require']"));
        
        sel.attribute.should.equal("name");
        sel.comparator.should.equal("=");
        sel.value.should.equal("require");

        sel = QueryParser.parseAttrSelector(new StrScanner("[ name= 'require' ]"));
        
        sel.attribute.should.equal("name");
        sel.comparator.should.equal("=");
        sel.value.should.equal("require");

        sel = QueryParser.parseAttrSelector(new StrScanner("[name=require]"));

        sel.attribute.should.equal("name");
        sel.comparator.should.equal("=");
        sel.value.should.equal("require");

        sel = QueryParser.parseAttrSelector(new StrScanner("[name]"));

        sel.attribute.should.equal("name");
        sel.comparator.should.equal("=");
        sel.value.should.equal("*");
        
        ["^=", "$=", "|=", "~="].forEach(function (c) {
            sel = QueryParser.parseAttrSelector(new StrScanner("[name" + c + "'require']"));
            
            sel.attribute.should.equal("name");
            sel.comparator.should.equal(c);
            sel.value.should.equal("require");
        });
    });
    
    test("Parse Selector", function () {
        var sel, scanner;
        
        sel = QueryParser.parseSelector(new StrScanner("Identifier"));
        sel.attribute.should.equal("type");
        sel.comparator.should.equal("=");
        sel.value.should.equal("Identifier");
        
        sel = QueryParser.parseSelector(new StrScanner("[type='FunctionExpression']"));
        sel.attribute.should.equal("type");
        sel.comparator.should.equal("=");
        sel.value.should.equal("FunctionExpression");
        
        scanner = new StrScanner("Identifier[type='FunctionExpression']");
        sel = QueryParser.parseSelector(scanner);
        sel.attribute.should.equal("type");
        sel.comparator.should.equal("=");
        sel.value.should.equal("Identifier");

        sel = QueryParser.parseSelector(scanner);
        sel.attribute.should.equal("type");
        sel.comparator.should.equal("=");
        sel.value.should.equal("FunctionExpression");
    });
    
    test("Parse Rule: VariableDeclarations.declarations > Identifier[name = 'foo']", function () {
        var rule;
        
        rule = QueryParser.parseRule(new StrScanner("VariableDeclarations.declarations > Identifier[name = 'foo']"));
        
        rule.selectors[0].type.should.equal(Selector.TYPES.SELF);
        rule.selectors[0].attribute.should.equal("type");
        rule.selectors[0].comparator.should.equal("=");
        rule.selectors[0].value.should.equal("VariableDeclarations");

        rule.selectors[1].type.should.equal(Selector.TYPES.MEMBER);
        rule.selectors[1].attribute.should.equal("declarations");

        rule.selectors[2].type.should.equal(Selector.TYPES.SELF);
        rule.selectors[2].attribute.should.equal("type");
        rule.selectors[2].comparator.should.equal("=");
        rule.selectors[2].value.should.equal("Identifier");

        rule.selectors[3].type.should.equal(Selector.TYPES.SELF);
        rule.selectors[3].attribute.should.equal("name");
        rule.selectors[3].comparator.should.equal("=");
        rule.selectors[3].value.should.equal("foo");
    });
    
    test("Parse Rule: Identifier[name = 'foo']", function () {
        var rule;
        
        rule = QueryParser.parseRule(new StrScanner("Identifier[name = 'foo']"));
        rule.selectors[0].attribute.should.equal("type");
        rule.selectors[0].comparator.should.equal("=");
        rule.selectors[0].value.should.equal("Identifier");

        rule.selectors[1].attribute.should.equal("name");
        rule.selectors[1].comparator.should.equal("=");
        rule.selectors[1].value.should.equal("foo");
    });
    
    test("Parse Rule: FunctionExpression Identifier", function () {
        var rule;
        
        rule = QueryParser.parseRule(new StrScanner("FunctionExpression Identifier"));
        rule.selectors[0].type.should.equal(Selector.TYPES.ANCESTOR);
        rule.selectors[0].attribute.should.equal("type");
        rule.selectors[0].comparator.should.equal("=");
        rule.selectors[0].value.should.equal("FunctionExpression");
        
        rule.selectors[1].type.should.equal(Selector.TYPES.SELF);
        rule.selectors[1].attribute.should.equal("type");
        rule.selectors[1].comparator.should.equal("=");
        rule.selectors[1].value.should.equal("Identifier");
    });
    
    test("Parse Rule: FunctionExpression (note the trailing whitespace)", function () {
        var rule;
        
        rule = QueryParser.parseRule(new StrScanner("FunctionExpression "));
        rule.selectors[0].type.should.equal(Selector.TYPES.SELF);
        rule.selectors[0].attribute.should.equal("type");
        rule.selectors[0].comparator.should.equal("=");
        rule.selectors[0].value.should.equal("FunctionExpression");
    });

    test("Parse Rules: FunctionExpression , Identifier", function () {
        var rules;
        
        rules = QueryParser.parseRules(new StrScanner("FunctionExpression , Identifier"));
        rules[0].selectors[0].type.should.equal(Selector.TYPES.SELF);
        rules[0].selectors[0].attribute.should.equal("type");
        rules[0].selectors[0].comparator.should.equal("=");
        rules[0].selectors[0].value.should.equal("FunctionExpression");

        rules[1].selectors[0].type.should.equal(Selector.TYPES.SELF);
        rules[1].selectors[0].attribute.should.equal("type");
        rules[1].selectors[0].comparator.should.equal("=");
        rules[1].selectors[0].value.should.equal("Identifier");
    });
    
    test("Parse Rule: FunctionExpression > BlockStatement", function () {
        var rule;
        
        rule = QueryParser.parseRule(new StrScanner("FunctionExpression > BlockStatement"));
        rule.selectors[0].type.should.equal(Selector.TYPES.PARENT);
        rule.selectors[0].attribute.should.equal("type");
        rule.selectors[0].comparator.should.equal("=");
        rule.selectors[0].value.should.equal("FunctionExpression");
        
        rule.selectors[1].type.should.equal(Selector.TYPES.SELF);
        rule.selectors[1].attribute.should.equal("type");
        rule.selectors[1].comparator.should.equal("=");
        rule.selectors[1].value.should.equal("BlockStatement");
    });

    test("Parse Rule: Identifier[name = 'foo'] + Literal", function () {
        var rule;
        
        rule = QueryParser.parseRule(new StrScanner("Identifier[name = 'foo'] + Literal"));
        rule.selectors[0].type.should.equal(Selector.TYPES.SELF);
        rule.selectors[0].attribute.should.equal("type");
        rule.selectors[0].comparator.should.equal("=");
        rule.selectors[0].value.should.equal("Identifier");
        
        rule.selectors[1].type.should.equal(Selector.TYPES.SIBLING);
        rule.selectors[1].attribute.should.equal("name");
        rule.selectors[1].comparator.should.equal("=");
        rule.selectors[1].value.should.equal("foo");

        rule.selectors[2].type.should.equal(Selector.TYPES.SELF);
        rule.selectors[2].attribute.should.equal("type");
        rule.selectors[2].comparator.should.equal("=");
        rule.selectors[2].value.should.equal("Literal");
    });

    test("Parse Rule: FunctionExpression > BlockStatement Identifier", function () {
        var rule;
        
        rule = QueryParser.parseRule(new StrScanner("FunctionExpression > BlockStatement Identifier"));
        rule.selectors[0].type.should.equal(Selector.TYPES.PARENT);
        rule.selectors[0].attribute.should.equal("type");
        rule.selectors[0].comparator.should.equal("=");
        rule.selectors[0].value.should.equal("FunctionExpression");
        
        rule.selectors[1].type.should.equal(Selector.TYPES.ANCESTOR);
        rule.selectors[1].attribute.should.equal("type");
        rule.selectors[1].comparator.should.equal("=");
        rule.selectors[1].value.should.equal("BlockStatement");
        
        rule.selectors[2].type.should.equal(Selector.TYPES.SELF);
        rule.selectors[2].attribute.should.equal("type");
        rule.selectors[2].comparator.should.equal("=");
        rule.selectors[2].value.should.equal("Identifier");
    });
    
    test("Parse Rules: Identifier, FunctionDeclaration", function () {
        var parser = new QueryParser(),
            rules
        ;
        
        rules = parser.parse("Identifier, FunctionDeclaration");
        rules[0].selectors[0].attribute.should.equal("type");
        rules[0].selectors[0].comparator.should.equal("=");
        rules[0].selectors[0].value.should.equal("Identifier");
        
        rules[1].selectors[0].attribute.should.equal("type");
        rules[1].selectors[0].comparator.should.equal("=");
        rules[1].selectors[0].value.should.equal("FunctionDeclaration");
    });
    
    (function () {
        var group = "Identifier[name = 'foo'], FunctionExpression > BlockStatement, " + 
                "FunctionExpression > BlockStatement Identifier"
        ;
        
        test("Parse Rules: " + group, function () {
            var parser = new QueryParser(),
                rules
            ;

            rules = parser.parse(group);

            rules[0].selectors[0].attribute.should.equal("type");
            rules[0].selectors[0].comparator.should.equal("=");
            rules[0].selectors[0].value.should.equal("Identifier");
            
            rules[0].selectors[1].attribute.should.equal("name");
            rules[0].selectors[1].comparator.should.equal("=");
            rules[0].selectors[1].value.should.equal("foo");
            
            rules[1].selectors[0].type.should.equal(Selector.TYPES.PARENT);
            rules[1].selectors[0].attribute.should.equal("type");
            rules[1].selectors[0].comparator.should.equal("=");
            rules[1].selectors[0].value.should.equal("FunctionExpression");
            
            rules[1].selectors[1].type.should.equal(Selector.TYPES.SELF);
            rules[1].selectors[1].attribute.should.equal("type");
            rules[1].selectors[1].comparator.should.equal("=");
            rules[1].selectors[1].value.should.equal("BlockStatement");
            
            rules[2].selectors[0].type.should.equal(Selector.TYPES.PARENT);
            rules[2].selectors[0].attribute.should.equal("type");
            rules[2].selectors[0].comparator.should.equal("=");
            rules[2].selectors[0].value.should.equal("FunctionExpression");
            
            rules[2].selectors[1].type.should.equal(Selector.TYPES.ANCESTOR);
            rules[2].selectors[1].attribute.should.equal("type");
            rules[2].selectors[1].comparator.should.equal("=");
            rules[2].selectors[1].value.should.equal("BlockStatement");
            
            rules[2].selectors[2].type.should.equal(Selector.TYPES.SELF);
            rules[2].selectors[2].attribute.should.equal("type");
            rules[2].selectors[2].comparator.should.equal("=");
            rules[2].selectors[2].value.should.equal("Identifier");
        });
        
    }());
});