/* global AOP */

(function (aop, global, undefined) {

    "use strict";

    var results = [];

    function pushReturn() {
        pushResult("return");
    }

    function throwError() {
        throw new Error();
        //pushResult("return");
    }

    function pushArguments(target, args) {
        pushResult(args[0]);
    }

    function pushBefore() {
        pushResult("before");
    }

    function pushAfter() {
        pushResult("after");
    }

    function pushAfterReturning() {
        pushResult("afterReturning");
    }

    function pushAfterThrowing() {
        pushResult("afterThrowing");
    }

    function pushAround(target, args) {
        try {
            pushBefore();
            /*jshint validthis:true */
            target.apply(this, args);
            pushAfterReturning();
        } catch (e) {
            pushAfterThrowing();
            throw e;
        } finally {
            pushAfter();
        }
    }

    function pushResult(result) {
        results.push(result);
    }

    function getResults() {
        return results;
    }

    function clearResults() {
        results = [];
    }

    (function () {

        AOP.test = {};

        AOP.test.pushReturn = pushReturn;
        AOP.test.throwError = throwError;
        AOP.test.pushArguments = pushArguments;

        AOP.test.pushBefore = pushBefore;
        AOP.test.pushAfter = pushAfter;
        AOP.test.pushAfterReturning = pushAfterReturning;
        AOP.test.pushAfterThrowing = pushAfterThrowing;
        AOP.test.pushAround = pushAround;

        AOP.test.pushResult = pushResult;
        AOP.test.getResults = getResults;
        AOP.test.clearResults = clearResults;
    }());

}(AOP, this));