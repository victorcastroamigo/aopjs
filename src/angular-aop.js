(function (angular, global, undefined) {

    "use strict";

    angular.module("aopjs",[]).factory("aopjs",[function(){
        var aop = global.AOP;
        aop.noConflict();
        return aop;
    }]);

}(angular, this));