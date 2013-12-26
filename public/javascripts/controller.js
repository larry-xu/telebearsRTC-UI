var app = angular.module("enrollmentApp", []);

app.config(function($httpProvider) {
  $httpProvider.interceptors.push(function($q, $rootScope) {
    return {
      'response': function(response) {
          $rootScope.$broadcast('loading-complete');
          return response || $q.when(response);
      }
    };
  });
});

app.directive("loadControls", function() {
  return {
    template: "Loading sections ... <i class='fa fa-spinner fa-spin'></i>",
    link: function(scope, element, attrs) {
      scope.$on("loading-complete", function(e) {
        element.html("<a class='button tiny'>Load All Data</a>");
      });
    }
  };
});

app.controller('DataCtrl', function($scope, $http) {

  $scope.init = function(id, course) {
    $scope.id = id;
    $scope.course = course;

    $http.get('/api/sections/'+$scope.id+'/'+$scope.course)
      .success(function(data) {
        $scope.sections = data;
        console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  }
});