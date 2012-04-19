
var appConfig   = CONFIG;


if (ENVIRONMENT === "dev") {
    console.log("A note to the developer...");
}

function MyClass () {}

MyClass.prototype = {
    appName: TOKEN("appName"),
    authorName: TOKEN("authorName"),
    
    specialMethod: MY_METHOD(),
};
