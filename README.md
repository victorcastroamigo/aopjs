## AopJS
###### A minimalistic aspect oriented javascript programming library and jQuery plugin

#### Getting started

An aspect definition takes a target function and some advices, returning a new function with the new expected behaviour

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
    var myProxy = AOP.aspect(myFunction).before(myAdvice);

    myProxy();
```
#####Output
```
myAdvice
myFunction
```

Advices can be of type *before*, *after*, *afterReturning*, *afterThrowing* and *around*.

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

Advices can be chained, the closest to the target function in the definition is also the closest in runtime.
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

            // do something

            target.apply(this, args); // target invocation

            // do something else
        });

    var myProxy = AOP.aspect(myFunction).advice(myAdvice);
```

In the previous example an around advice is used to do something before and after a target function. It should be noted that the target function invocation is handled in pure javascript syntax to keep things as simple as possible.

Other types of advices have access to target and args too

#####Input
```javascript    

    var myProxy = AOP.aspect(function (arg1, arg2) {
            console.log(arg1 + arg2);
        }).before(function(target, args) {
            console.log(args[0] + ' + ' + args[1] + ' = ');
        });

    myProxy(2, 3);
```
#####Output
```
2 + 3 = 5
```