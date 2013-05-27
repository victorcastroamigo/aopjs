## AopJS [![Build Status](https://travis-ci.org/victorcastroamigo/aopjs.png?branch=master)](https://travis-ci.org/victorcastroamigo/aopjs)

###### A minimalistic aspect oriented javascript programming library and jQuery plugin.

#### Getting started

Add the script to your page as a standalone library **OR** after jQuery if you plan to use it as a plugin. You can download it from the dist folder.

```html
    <!-- standalone-->
    <script src="../aop-0.5.1.min.js"></script>

    <!-- OR as a jQuery plugin -->
    <script src="../jquery-aop-0.5.1.min.js"></script>
```

Functionallity is accesible in the global variable AOP if used as a standalone library or in $.aop if used as a jQuery plugin.

An aspect definition takes a target function and some advices, returning a new function with the new expected behaviour.

#####Input
```javascript
    // Target function
    function myFunction() {
        console.log("myFunction");
    }

    // Advice
    function myAdvice() {
        console.log("myAdvice");
    }

    // Aspect
    
    var myProxy = AOP.aspect(myFunction).after(myAdvice); // standalone
    
    // OR as a jQuery plugin
    // var myProxy = $.aop.aspect(myFunction).after(myAdvice);

    myProxy();
```
#####Output
```
myFunction
myAdvice
```

Advices can be of type *before*, *after*, *afterReturning*, *afterThrowing* and *around*. Some jQuery friendly aliases are also provided: *complete* (after), *success* (afterReturning) and *error* (afterThrowing). In the next example both proxies have exactly the same beahaviour
#####Input
```javascript
    var myProxy1 = AOP.aspect(myFunction).after(myAdvice);
    var myProxy2 = AOP.aspect(myFunction).complete(myAdvice);
```

Aspect definitions can also take a target object method. In that case we provide also the target object to allow the normal use of *this* inside the method.

#####Input
```javascript
    var myObject = {
        myMethod: function () {
            // do something
        }
    }
    var myProxy = AOP.aspect(myObject.myMethod, myObject).before(myAdvice);
```

When aspect definitions take just a target object all the methods in the object get decorated.

#####Input
```javascript
    var myObject = {
        myMethod: function () {
            console.log("myMethod");
        }
        myOtherMethod: function () {
            console.log("myOtherMethod");
        }
    }

    function myAdvice() {
        console.log("myAdvice");
    }

    AOP.aspect(myObject).after(myAdvice);

    myObject.myMethod();
    myObject.myOtherMethod();
```
#####Output
```
myMethod
myAdvice
myOtherMethod
myAdvice
```

Advices can be chained, being the closest to the target function in the definition  also the closest in the execution stack.

#####Input
```javascript
    var myProxy = AOP.aspect(myFunction)
                        .before(myAdvice1)
                        .afterReturning(myAdvice2)
                        .afterThrowing(myAdvice3);
```

Advices can also be precompiled, but it is just a matter of taste, when not precompiled, advices cache their own proxy.

#####Input
```javascript    
    var myAdvice = AOP.around(function(target, args) {

            var retval;

            // do something before

            try {

                retval = target.apply(this, args); // target invocation

                // do something after returning

            } catch (e) {

                // do something after throwing

                throw e;
            } finally {

                // do something after
            }

            return retval
        });

    var myProxy = AOP.aspect(myFunction).advice(myAdvice);
```

In the previous example an around advice is used to do something before and after a target function. It should be noted that the target function invocation is handled in pure javascript syntax to keep things as simple as possible.

Other types of advices have access to target, args and retval too.

#####Input
```javascript
    var add = AOP.aspect(function (arg1, arg2) {
            return arg1 + arg2;
        }).before(function (target, args) {
            console.log(args[0] + " + " + args[1] + " = ");
        }).after(function (target, args, retval) {
            console.log(retval);
        }),
        returnValue = add(2, 3); // returnValue == 5
```
#####Output
```
2 + 3 = 5
```

#### Advanced usage

Every advice definition method can take a variable number of functions.

#####Input
```javascript
    var myProxy = AOP.aspect(myFunction)
                        .after(myAdvice1, myAdvice2),
        myProxy2 = AOP.aspect(myFunction)
                        .after(myAdvice1)
                        .after(myAdvice2);
```

Both calls in the previous example produce the same output. Also remember that myAdvice1 will be invoked before myAdvice2 as the closest advice to the aspect will create the inner most proxy in the execution stack. 

As stated earlier, precompiling the advices is not a matter of performance but a matter of taste. Still it is rather useful to create advice compositions.

#####Input
```javascript

    var aroundComposite = AOP.advice()
                                .before(myAdvice1)
                                .afterReturning(myAdvice2)
                                .afterThrowing(myAdvice3)
                                .after(myAdvice4)
                                .around(myAdvice5),
        // alternative syntax                        
        beforePrecompiled = AOP.before(myAdvice1),
        afterReturningPrecompiled = AOP.afterReturning(myAdvice2),
        afterThrowingPrecompiled = AOP.afterThrowing(myAdvice3),
        afterPrecompiled = AOP.after(myAdvice4),
        aroundPrecompiled = AOP.around(myAdvice5),
        aroundPrecompiledComposite = AOP.advice(beforePrecompiled,
                                                    afterReturningPrecompiled,
                                                    afterThrowingPrecompiled,
                                                    afterPrecompiled,
                                                    aroundPrecompiled),
        myProxy = AOP.aspect(myFunction).advice(aroundComposite),
        myProxy2 = AOP.aspect(myFunction).advice(aroundPrecompiledComposite);
```

In the previous example both the aroundComposite and the aroundPrecompiledComposite have the same behaviour, they are just syntactic alternatives to create a precompiled advice with the compound behaviour of all the provided advices.

Another advanced technique would be the use of currying to create parameterized advices.

#####Input
```javascript
    function logAdvice(logger) {
        return logger.log("logAdvice");
    }
    var consoleLogAdvice = logAdvice.curry(console),
        myProxy = AOP.aspect(myFunction)
                        .after(consoleLogAdvice);

    myProxy();
```
#####Output
```
logAdvice
```
