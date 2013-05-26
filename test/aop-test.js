    
/* global QUnit */
/* global test */
/* global ok */
/* global deepEqual */
/* global AOP */

QUnit.testStart(function testStart() {

    "use strict";

    AOP.test.clearResults();
});

test("before", function test() {

    "use strict";

    (AOP.aspect(AOP.test.pushReturn).before(AOP.test.pushBefore)());

    deepEqual(AOP.test.getResults(), ["before", "return"]);

});

test("afterReturning return", function test() {

    "use strict";

    (AOP.aspect(AOP.test.pushReturn).afterReturning(AOP.test.pushAfterReturning)());

    deepEqual(AOP.test.getResults(), ["return", "afterReturning"]);
});

test("afterReturning throw", function test() {

    "use strict";

    try {
        (AOP.aspect(AOP.test.throwError).afterReturning(AOP.test.pushAfterReturning)());
    } catch (e) {
        deepEqual(AOP.test.getResults(), []);
    }
});

test("afterThrowing return", function test() {

    "use strict";

    (AOP.aspect(AOP.test.pushReturn).afterThrowing(AOP.test.pushAfterThrowing)());

    deepEqual(AOP.test.getResults(), ["return"]);

});

test("afterThrowing error", function test() {

    "use strict";

    try {
        (AOP.aspect(AOP.test.throwError).afterThrowing(AOP.test.pushAfterThrowing)());
    } catch (e) {
        deepEqual(AOP.test.getResults(), ["afterThrowing"]);
    }
});

test("after return", function test() {

    "use strict";

    (AOP.aspect(AOP.test.pushReturn).after(AOP.test.pushAfter)());

    deepEqual(AOP.test.getResults(), ["return", "after"]);

});

test("after throw", function test() {

    "use strict";

    try {
        (AOP.aspect(AOP.test.throwError).after(AOP.test.pushAfter)());
    } catch (e) {
        deepEqual(AOP.test.getResults(), ["after"]);
    }

});

test("around return", function test() {

    "use strict";

    (AOP.aspect(AOP.test.pushReturn).around(AOP.test.pushAround)());

    deepEqual(AOP.test.getResults(), ["before", "return", "afterReturning", "after"]);

});

test("around throw", function test() {

    "use strict";

    try {
        (AOP.aspect(AOP.test.throwError).around(AOP.test.pushAround)());
    } catch (e) {
        deepEqual(AOP.test.getResults(), ["before", "afterThrowing", "after"]);
    }
});

test("chaining", function test() {

    "use strict";

    (AOP.aspect(AOP.test.pushReturn)
        .before(AOP.test.pushBefore)
        .afterReturning(AOP.test.pushAfterReturning)
        .afterThrowing(AOP.test.pushAfterThrowing)
        .after(AOP.test.pushAfter)
        .around(AOP.test.pushAround)
        ());

    deepEqual(AOP.test.getResults(),
        ["before", "before", "return", "afterReturning", "after", "afterReturning", "after"]);
});

test("varargs", function test() {

    "use strict";

    (AOP.aspect(AOP.test.pushReturn)
        .before(AOP.test.pushBefore, AOP.test.pushBefore)
        .afterReturning(AOP.test.pushAfterReturning, AOP.test.pushAfterReturning)
        .afterThrowing(AOP.test.pushAfterThrowing, AOP.test.pushAfterThrowing)
        .after(AOP.test.pushAfter, AOP.test.pushAfter)
        .around(AOP.test.pushAround, AOP.test.pushAround)
        ());

    deepEqual(AOP.test.getResults(), ["before", "before", "before", "before",
                                        "return",
                                        "afterReturning", "afterReturning",
                                        "after", "after",
                                        "afterReturning", "after",
                                        "afterReturning", "after"]);
});

test("composite", function test() {

    "use strict";

    var aroundComposite = AOP.advice()
                                    .before(AOP.test.pushBefore)
                                    .afterReturning(AOP.test.pushAfterReturning)
                                    .afterThrowing(AOP.test.pushAfterThrowing)
                                    .after(AOP.test.pushAfter)
                                    .around(AOP.test.pushAround);

    (AOP.aspect(AOP.test.pushReturn).advice(aroundComposite)());

    deepEqual(AOP.test.getResults(),
        ["before", "before", "return", "afterReturning", "after", "afterReturning", "after"]);

});

test("precompiled", function test() {

    "use strict";

    var beforePrecompiled = AOP.before(AOP.test.pushBefore),
        afterReturningPrecompiled = AOP.afterReturning(AOP.test.pushAfterReturning),
        afterThrowingPrecompiled = AOP.afterThrowing(AOP.test.pushAfterThrowing),
        afterPrecompiled = AOP.after(AOP.test.pushAfter),
        aroundPrecompiled = AOP.around(AOP.test.pushAround),
        aroundPrecompiledComposition = AOP.advice(beforePrecompiled,
                                                    afterReturningPrecompiled,
                                                    afterThrowingPrecompiled,
                                                    afterPrecompiled,
                                                    aroundPrecompiled);

    (AOP.aspect(AOP.test.pushReturn).advice(aroundPrecompiledComposition)());

    deepEqual(AOP.test.getResults(),
        ["before", "before", "return", "afterReturning", "after", "afterReturning", "after"]);

});

test("order", function test() {

    "use strict";

    var aroundComposite = AOP.advice()
                                    .after(AOP.test.pushAfter)
                                    .afterThrowing(AOP.test.pushAfterThrowing)
                                    .afterReturning(AOP.test.pushAfterReturning)
                                    .before(AOP.test.pushBefore);

    (AOP.aspect(AOP.test.pushReturn).advice(aroundComposite)());

    deepEqual(AOP.test.getResults(), ["before", "return", "after", "afterReturning"]);
});

test("before cache", function test() {

    "use strict";

    /*jshint unused:false */
    var beforePrecompiled = AOP.before(AOP.test.pushBefore),
        /*jshint unused:false */
        afterPrecompiled = AOP.after(AOP.test.pushAfter),
        beforeCache = AOP.test.pushBefore["@before"];

    AOP.test.pushBefore["@before"] = AOP.test.pushAfter["@after"];

    (AOP.aspect(AOP.test.pushReturn).before(AOP.test.pushBefore)());

    deepEqual(AOP.test.getResults(), ["return", "after"]);

    AOP.test.clearResults();
    AOP.test.pushBefore["@before"] = undefined;

    (AOP.aspect(AOP.test.pushReturn).before(AOP.test.pushBefore)());

    deepEqual(AOP.test.getResults(), ["before", "return"]);

    ok(AOP.test.pushBefore["@before"]);
});

test("afterReturning cache", function test() {

    "use strict";

    /*jshint unused:false */
    var afterReturningPrecompiled = AOP.afterReturning(AOP.test.pushAfterReturning),
        /*jshint unused:false */
        beforePrecompiled = AOP.before(AOP.test.pushBefore),
        afterReturningCache = AOP.test.pushAfterReturning["@afterReturning"];

    AOP.test.pushAfterReturning["@afterReturning"] = AOP.test.pushBefore["@before"];

    (AOP.aspect(AOP.test.pushReturn).afterReturning(AOP.test.pushAfterReturning)());

    deepEqual(AOP.test.getResults(), ["before", "return"]);

    AOP.test.clearResults();
    AOP.test.pushAfterReturning["@afterReturning"] = undefined;

    (AOP.aspect(AOP.test.pushReturn).afterReturning(AOP.test.pushAfterReturning)());

    deepEqual(AOP.test.getResults(), ["return", "afterReturning"]);

    ok(AOP.test.pushAfterReturning["@afterReturning"]);
});

test("afterThrowing cache", function test() {

    "use strict";

    /*jshint unused:false */
    var afterThrowingPrecompiled = AOP.afterThrowing(AOP.test.pushAfterThrowing),
        /*jshint unused:false */
        beforePrecompiled = AOP.before(AOP.test.pushBefore),
        afterThrowingCache = AOP.test.pushAfterThrowing["@afterThrowing"];

    AOP.test.pushAfterThrowing["@afterThrowing"] = AOP.test.pushBefore["@before"];

    try {
        (AOP.aspect(AOP.test.throwError).afterThrowing(AOP.test.pushAfterThrowing)());
    } catch (e) {
        deepEqual(AOP.test.getResults(), ["before"]);
    }

    AOP.test.clearResults();
    AOP.test.pushAfterThrowing["@afterThrowing"] = undefined;

    try {
        (AOP.aspect(AOP.test.throwError).afterThrowing(AOP.test.pushAfterThrowing)());
    } catch (e) {
        deepEqual(AOP.test.getResults(), ["afterThrowing"]);
    }

    ok(AOP.test.pushAfterThrowing["@afterThrowing"]);
});

test("after cache", function test() {

    "use strict";

    /*jshint unused:false */
    var afterPrecompiled = AOP.after(AOP.test.pushAfter),
        /*jshint unused:false */
        beforePrecompiled = AOP.before(AOP.test.pushBefore),
        afterCache = AOP.test.pushAfter["@after"];

    AOP.test.pushAfter["@after"] = AOP.test.pushBefore["@before"];

    try {
        (AOP.aspect(AOP.test.throwError).after(AOP.test.pushAfter)());
    } catch (e) {
        deepEqual(AOP.test.getResults(), ["before"]);
    }

    AOP.test.clearResults();
    AOP.test.pushAfter["@after"] = undefined;

    try {
        (AOP.aspect(AOP.test.throwError).after(AOP.test.pushAfter)());
    } catch (e) {
        deepEqual(AOP.test.getResults(), ["after"]);
    }

    ok(AOP.test.pushAfter["@after"]);
});

test("around cache", function test() {

    "use strict";

    /*jshint unused:false */
    var aroundPrecompiled = AOP.around(AOP.test.pushAround),
        /*jshint unused:false */
        beforePrecompiled = AOP.before(AOP.test.pushBefore),
        aroundCache = AOP.test.pushAround["@around"];

    AOP.test.pushAround["@around"] = AOP.test.pushBefore["@before"];

    (AOP.aspect(AOP.test.pushReturn).around(AOP.test.pushAround)());

    deepEqual(AOP.test.getResults(), ["before", "return"]);

    AOP.test.clearResults();
    AOP.test.pushAround["@around"] = undefined;

    (AOP.aspect(AOP.test.pushReturn).around(AOP.test.pushAround)());

    deepEqual(AOP.test.getResults(), ["before", "return", "afterReturning", "after"]);

    ok(AOP.test.pushAround["@around"]);
});

test("object", function test() {

    "use strict";

    var object = {
        method1: AOP.test.pushReturn,
        method2: AOP.test.throwError
    };

    object.method1();

    try {
        object.method2();
        ok(false);
    } catch (e) {
        //
    }

    deepEqual(AOP.test.getResults(), ["return"]);

    AOP.aspect(object).before(AOP.test.pushBefore)
                        .afterReturning(AOP.test.pushAfterReturning)
                        .afterThrowing(AOP.test.pushAfterThrowing);

    object.method1();

    try {
        object.method2();
        ok(false);
    } catch (e) {
        //
    }

    deepEqual(AOP.test.getResults(),
        ["return", "before", "return", "afterReturning", "before", "afterThrowing"]);
});

test("this", function test() {

    "use strict";

    var myObject = {
            myProperty: "myProperty",
            myMethod: function () {
                AOP.test.pushResult(this.myProperty);
            }
        },
        myFunction = AOP.aspect(myObject.myMethod, myObject).before(AOP.test.pushBefore);

    myFunction("myargs");

    AOP.aspect(myObject).after(AOP.test.pushAfter);

    myObject.myMethod();

    deepEqual(AOP.test.getResults(), ["before", "myProperty", "myProperty", "after"]);
});

test("arguments", function test() {

    "use strict";

    var before = AOP.before(AOP.test.pushArguments),
        beforeAfter = AOP.advice(before).after(AOP.test.pushArguments),
        myFunction = AOP.aspect(AOP.test.pushReturn)
                                    .advice(beforeAfter)
                                    .afterReturning(AOP.test.pushArguments),
        myThrowingFunction = AOP.aspect(AOP.test.throwError)
                                    .afterThrowing(AOP.test.pushArguments);

    myFunction("myArgs");
    try {
        myThrowingFunction("myArgs");
    } catch (e) {
        // do nothing
    }

    deepEqual(AOP.test.getResults(), ["myArgs", "return", "myArgs", "myArgs", "myArgs"]);
});

test("return value", function test() {

    "use strict";

    var myObject = {
            myProperty: "myProperty",
            myMethod: AOP.aspect(function () {
                return "myReturnValue";
            }).before(AOP.test.pushBefore)
            .around(AOP.test.pushAround)
            .afterReturning(AOP.test.pushReturnValue)
            .after(AOP.test.pushReturnValue)
        }, returnValue = myObject.myMethod();

    deepEqual(returnValue, "myReturnValue");
    deepEqual(AOP.test.getResults(),
        ["before", "before", "afterReturning", "after", "myReturnValue", "myReturnValue"]);
});

test("return value", function test() {

    "use strict";

    var myObject = {
            myProperty: "myProperty",
            myMethod: AOP.aspect(function () {
                return "myReturnValue";
            }).before(AOP.test.pushBefore)
            .around(AOP.test.pushAround)
            .afterReturning(AOP.test.pushReturnValue)
            .after(AOP.test.pushReturnValue)
        }, returnValue = myObject.myMethod();

    deepEqual(returnValue, "myReturnValue");
    deepEqual(AOP.test.getResults(),
        ["before", "before", "afterReturning", "after", "myReturnValue", "myReturnValue"]);
});

test("readme", function test() {

    "use strict";

    var add = AOP.aspect(function (arg1, arg2) {
            return arg1 + arg2;
        }).before(function (target, args) {
            AOP.test.pushResult(args[0] + " + " + args[1] + " = ");
        }).after(function (target, args, retval) {
            AOP.test.pushResult("" + retval);
        }),
        returnValue = add(2, 3); // returnValue == 5

    deepEqual(returnValue, 5);
    deepEqual(AOP.test.getResults(),
        ["2 + 3 = ", "5"]);
});

test("currying", function test() {

    "use strict";

    var consoleLogAdvice, curryTest;

    Function.prototype.method = function (name, func) {
        if (!this.prototype[name]) {
            this.prototype[name] = func;
            return this;
        }
    };

    Function.method("curry", function () {
        var slice = Array.prototype.slice,
            args = slice.apply(arguments),
            that = this;
        return function () {
            return that.apply(null, args.concat(slice.apply(arguments)));
        };
    });

    function logAdvice(logger) {
        return logger.log("logAdvice");
    }

    consoleLogAdvice = logAdvice.curry({
        log: function (arg) {
            AOP.test.pushResult(arg);
        }
    });

    curryTest = AOP.aspect(AOP.test.pushReturn).before(consoleLogAdvice);

    curryTest();

    deepEqual(AOP.test.getResults(), ["logAdvice", "return"]);
});
