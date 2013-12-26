var app = angular.module("enrollmentApp", []);

app.config(function($httpProvider) {
  $httpProvider.interceptors.push(function($q, $rootScope) {
    return {
      'response': function(response) {
          if(response.config.url.indexOf('sections') > -1)
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
        element.children('a').bind('click', scope.loadData);
      });
    }
  };
});

app.controller('DataCtrl', function($scope, $http) {

  $scope.init = function(id, course) {
    $http.get('/api/sections/'+id+'/'+course)
      .success(function(data) {
        $scope.sections = data;
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  }

  $scope.loadData = function() {
    angular.forEach($scope.sections, function(section, key) {
      var ccn = section.ccn;
      $scope.load(key, ccn);
    });
  };

  $scope.load = function(index, ccn) {
    $scope.sections[index].loading = "fa-spin";
    $http.get('/api/enrollment/'+ccn)
      .success(function(data) {
        $scope.sections[index].date = new Date().toLocaleString();
        $scope.sections[index].enrollment = data.enroll + '/' + data.enrollLimit;
        $scope.sections[index].waitlist = data.waitlist + '/' + data.waitlistLimit;
        if(data.enroll == data.enrollLimit)
          $scope.sections[index].filled = 'filled';
        $scope.sections[index].loading = "";
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  }
});