var values = {
        "object": {},
        "array": [],
        "number": 9,
        "boolean": true,
        "string": "string"
    },
    env = process.env.ENVIRONMENT || "dev"
;

module.exports = {
    ENVIRONMENT: ["string", env],
    DEBUG: ["name", process.env.ENVIRONMENT === "dev" ? "true" : "false"]
};
