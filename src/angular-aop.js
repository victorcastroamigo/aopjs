(function (angular, global, undefined) {

    "use strict";

    angular.module("aopjs", []).service("aopjs", [function (){
        var aop = global.AOP;
        aop.noConflict();
        this.aop = aop;
    }]);

}(angular, this));