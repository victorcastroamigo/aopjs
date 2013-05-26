/* global test */
/* global deepEqual */
/* global AOP */

test("before", function test() {

    "use strict";

    var results = [],
        myFunction = $.aop.aspect(function (condition) {
                if (!condition) {
                    throw new Error();
                }
                results.push("return");
            }).complete(function () {
                results.push("complete");
            }).success(function () {
                results.push("success");
            }).error(function () {
                results.push("error");
            });


    myFunction(true);
    try {
        myFunction(false);
    } catch (e) {
        // do nothing
    }

    deepEqual(AOP, undefined);
    deepEqual(results, ["return", "complete", "success", "complete", "error"]);
});
