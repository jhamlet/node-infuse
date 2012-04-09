var values = {
        "object": {
            foo: "foo",
            baz: 99
        },
        "array": [
            1, "2", NaN
        ],
        "number": 9,
        "boolean": true,
        "string": "string"
    },
    ASTValues = {
        "true": ["name", "true"],
        "false": ["name", "false"],
        "undefined": ["name", "undefined"]
    },
    env = process.env.ENVIRONMENT || "dev"
;

module.exports = {
    ENVIRONMENT: ["string", env],
    DEBUG: env === "dev" ? ASTValues["true"] : ASTValues["false"]
};
