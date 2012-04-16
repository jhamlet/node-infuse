var STRINGS = {
        "UI.STRING.TITLE": "The title",
        "UI.STRING.SUB-TITLE": "The sub-title"
    },
    env = process.env.ENVIRONMENT || "dev"
;

module.exports = {
    TITLE_KEY: "UI.STRING.TITLE",
    ENVIRONMENT: env,
    DEBUG: env === "dev" ? true : false,
    STRINGS: function (key) {
        return STRINGS[key] || "";
    },
    MAKE_SPECIAL_METHOD: function (env) {
        return env === "dev" ? function () {
            return "DEV";
        } : function () {
            return "NOT DEV";
        };
    },
    EXEC: function (fn) {
        return fn();
    }
};
