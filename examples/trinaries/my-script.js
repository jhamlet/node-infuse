var myObj = {};

if (false) {
    console.log("Showing you false");
}
else {
    console.log("Showing you else");
}

myObj.doSomething = BUILD_TYPE === "debug" ?
    function () {
        return "truthy";
    } :
    function () {
        return "falsey";
    };
    
