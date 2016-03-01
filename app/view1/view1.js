'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', function($scope) {
    $scope.message = '';
    $scope.url_in = 'Something not right';
    
    var urlRegex = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;

    $scope.validateURL = function validateURL(s) {
        if (!urlRegex.test(s)) {
            setTimeout(function(){
                $scope.message = '';
                $('.alert').text('').fadeOut();
            }, 3000);
            $scope.message = 'Invalid URL. Please enter a valid one before moving next.';
        }
    }
});
