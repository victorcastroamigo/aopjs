/*! AopJS 0.5.3 - (c) 2013 Víctor Castro Amigo - MIT License */
(function (global, undefined) {

    "use strict";

    var AOP = {}, preexistingAOP;

    //
    // Advice
    //

    function precompiledFactory(advice) {

        return advice;
    }

    function beforeFactory(advice) {

        var beforeAdvice, cacheProperty = "@before";

        beforeAdvice = advice[cacheProperty];
        if (!beforeAdvice) {
            beforeAdvice = function (target) {
                return function () {
                    advice.call(this, target, arguments);
                    // provides access to target and arguments inside the advice
                    return target.apply(this, arguments);
                };
            };
            advice[cacheProperty] = beforeAdvice;
        }

        return beforeAdvice;
    }

    function afterFactory(advice) {

        var afterAdvice, cacheProperty = "@after";

        afterAdvice = advice[cacheProperty];
        if (!afterAdvice) {
            afterAdvice = function (target) {
                return function () {
                    var returnValue;
                    try {
                        returnValue = target.apply(this, arguments);
                        return returnValue;
                    } finally {
                        advice.call(this, target, arguments, returnValue);
                        // provides access to target and arguments inside the advice
                    }
                };
            };
            advice[cacheProperty] = afterAdvice;
        }

        return afterAdvice;
    }

    function afterReturningFactory(advice) {

        var afterReturningAdvice, cacheProperty = "@afterReturning";

        afterReturningAdvice = advice[cacheProperty];
        if (!afterReturningAdvice) {
            afterReturningAdvice = function (target) {
                return function () {
                    var returnValue = target.apply(this, arguments);
                    advice.call(this, target, arguments, returnValue);
                    return returnValue;
                    // provides access to target and arguments inside the advice
                };
            };
            advice[cacheProperty] = afterReturningAdvice;
        }

        return afterReturningAdvice;
    }

    function afterThrowingFactory(advice) {

        var afterThrowingAdvice, cacheProperty = "@afterThrowing";

        afterThrowingAdvice = advice[cacheProperty];
        if (!afterThrowingAdvice) {
            afterThrowingAdvice = function (target) {
                return function () {
                    try {
                        return target.apply(this, arguments);
                    } catch (e) {
                        advice.call(this, target, arguments);
                        // provides access to target and arguments inside the advice
                        throw e;
                    }
                };
            };
            advice[cacheProperty] = afterThrowingAdvice;
        }

        return afterThrowingAdvice;
    }

    function aroundFactory(advice) {

        var aroundAdvice, cacheProperty = "@around";

        aroundAdvice = advice[cacheProperty];
        if (!aroundAdvice) {
            aroundAdvice = function (target) {
                return function () {
                    return advice.call(this, target, arguments);
                };
            };
            advice[cacheProperty] = aroundAdvice;
        }

        return aroundAdvice;
    }

    function AdviceCollection(advices) {

        this.advices = [].concat(advices);

        return this;
    }

    function advice() {

        var adviceCollection = new AdviceCollection(Array.prototype.slice.apply(arguments));

        function adviceMetaFactory(adviceFactory) {

            return function advice() {

                var i, imax, advices = arguments;

                for (i = 0, imax = advices.length; i < imax; i += 1) {
                    adviceCollection.advices.push(adviceFactory(advices[i]));
                }

                return this;
            };
        }

        adviceCollection.advice = adviceMetaFactory(precompiledFactory);
        adviceCollection.around = adviceMetaFactory(aroundFactory);
        adviceCollection.before = adviceMetaFactory(beforeFactory);
        adviceCollection.after = adviceMetaFactory(afterFactory);
        adviceCollection.afterReturning = adviceMetaFactory(afterReturningFactory);
        adviceCollection.afterThrowing = adviceMetaFactory(afterThrowingFactory);

        return adviceCollection;
    }

    //
    // Joinpoint
    //

    function joinPointCollection(joinPoints) {

        var proceedingJoinPoint = {};

        function adviceMetaFactory(adviceFactoryName) {

            return function advice() {

                var i, imax;

                for (i = 0, imax = joinPoints.length; i < imax; i += 1) {
                    joinPoints[i][adviceFactoryName].apply(joinPoints[i], arguments);
                }

                return this;
            };
        }

        proceedingJoinPoint.advice = adviceMetaFactory("advice");
        proceedingJoinPoint.around = adviceMetaFactory("around");
        proceedingJoinPoint.before = adviceMetaFactory("before");
        proceedingJoinPoint.after = adviceMetaFactory("after");
        proceedingJoinPoint.afterReturning = adviceMetaFactory("afterReturning");
        proceedingJoinPoint.afterThrowing = adviceMetaFactory("afterThrowing");

        return proceedingJoinPoint;
    }

    function executionJoinPoint(target, caller) {

        function proceedingJoinPoint() {
            return target.apply(caller, arguments);
        }

        function adviceMetaFactory(adviceFactory) {

            return function () {

                var i, imax, j, jmax, advices = arguments, adviceCollection;

                for (i = 0, imax = advices.length; i < imax; i += 1) {

                    if (advices[i] instanceof AdviceCollection) {
                        adviceCollection = [].concat(advices[i].advices);
                    } else {
                        adviceCollection = [advices[i]];
                    }

                    for (j = 0, jmax = adviceCollection.length; j < jmax; j += 1) {
                        target = adviceFactory(adviceCollection[j])(target);
                    }
                }

                return this;
            };
        }

        proceedingJoinPoint.advice = adviceMetaFactory(precompiledFactory);
        proceedingJoinPoint.around = adviceMetaFactory(aroundFactory);
        proceedingJoinPoint.before = adviceMetaFactory(beforeFactory);
        proceedingJoinPoint.after =
            proceedingJoinPoint.complete = adviceMetaFactory(afterFactory);
        proceedingJoinPoint.afterReturning =
            proceedingJoinPoint.success = adviceMetaFactory(afterReturningFactory);
        proceedingJoinPoint.afterThrowing =
            proceedingJoinPoint.error = adviceMetaFactory(afterThrowingFactory);

        return proceedingJoinPoint;
    }

    //
    // Aspect
    //

    function aspect(target, caller) {

        var joinPoint, joinPoints = [], targetName;

        if (typeof target === "function") {
            joinPoint = executionJoinPoint(target, caller);
        } else {
            caller = target;
            for (targetName in caller) {
                if (caller.hasOwnProperty(targetName) &&
                    typeof caller[targetName] === "function") {
                    joinPoint = executionJoinPoint(caller[targetName], caller);
                    caller[targetName] = joinPoint;
                    joinPoints.push(joinPoint);
                }
            }
            joinPoint = joinPointCollection(joinPoints);
        }

        return joinPoint;
    }

    //
    // Plumbing
    //

    function noConflict() {
        if (global.AOP === AOP) {
            global.AOP = preexistingAOP;
        }
        return AOP;
    }

    AOP.around = aroundFactory;
    AOP.before = beforeFactory;
    AOP.after = AOP.complete = afterFactory;
    AOP.afterReturning = AOP.success = afterReturningFactory;
    AOP.afterThrowing = AOP.error = afterThrowingFactory;

    AOP.aspect = aspect;
    AOP.advice = advice;

    AOP.noConflict = noConflict;

    preexistingAOP = global.AOP;
    global.AOP = AOP;

})(this);
;(function (angular, global, undefined) {

    "use strict";

    angular.module("aopjs", []).service("aopjs", [function () {
        var aop = global.AOP;
        aop.noConflict();
        this.aop = aop;
    }]);

}(this.angular, this));