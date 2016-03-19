'use strict';

(function() {

function showMessage(msg, type) {
    var node = $('#msg');
    setTimeout(function(){
        node.fadeOut();
    }, 5000);
    node.text(msg);
    type = (typeof(type) == 'undefined')?'info':type;
    type = 'alert alert-' + type;
    node.attr('class', type).fadeIn();
}

class MainController {

  constructor($scope, $http) {
    this.$http = $http;
    this.$scope = $scope;
    this.$scope.notReady = true;
  }

  $onInit() {
  }

  reset() {
    this.$scope.url0 = null;
    this.$scope.key = null;
    this.$scope.miniURL = null; 
    this.$scope.notReady = true;
    $('.invalid-key').hide();
  }

  validateURL() {

    function makeIt() {
        $http.post('/make', {'url': url0, 'key': $scope.key})
        .then(function success(res) {
            if (res.data.success) {
                if ($scope.key && $scope.key != res.data.miniKey) {
                    showMessage('This URL already exists');
                }
                $scope.key = res.data.miniKey;
                $scope.miniURL = res.data.miniURL;
                $scope.notReady = false;
            }
        }, function error(res) {
        });
    }

    var urlRegex = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
    var $scope = this.$scope;
    var $http = this.$http;

    var url0 = $scope.url0;
    if (!urlRegex.test(url0)) {
        showMessage('Invalid URL. Please enter a valid one before moving next.', 'danger');
        $scope.miniURL = null;
        return;
    } else {
        // Check availability of key if entered
        var customKey = ($scope.key)?$scope.key.trim():null;
        if (customKey) {
            this.$http.get('/check?key='+customKey)
            .then(function(res) {
                if (res.data.exist) {
                    $('.invalid-key').fadeIn();
                    $scope.key = null;
                    return;
                }
                makeIt();
            })
        } else {
            makeIt();
        }
    }
  }

}

angular.module('tinyurlApp')
  .component('main', {
    templateUrl: 'app/main/main.html',
    controller: MainController
  });

})();
