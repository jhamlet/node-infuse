var env = process.env.ENVIRONMENT || "dev",
    tokens = {
        appName: "My Great WebApp",
        authorName: "Me"
    },
    isDebug = env === "dev"
;

module.exports = {
    ENVIRONMENT: env,
    DEBUG: isDebug,
    TOKEN: function (key) {
        return tokens[key];
    },
    MY_METHOD: function () {
        return isDebug ?
            function () {
                return "is debug";
            } :
            function () {
                return "is not debug";
            }
    },
    CONFIG: {
        foo: "baz",
        baz: [1, 2, 3],
        doSomething: function () {
            return "something";
        },
        isDebug: isDebug
    }
};
