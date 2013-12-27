var app = angular.module("enrollmentApp", []);

app.controller('DataCtrl', function($scope, $http) {
  $scope.loading = true;
  $scope.initialized = false;
  $scope.enrollment = true;
  $scope.waitlist = true;

  function responsiveTable(newWidth, oldWidth) {
    if(!$scope.initialized) {
      if(newWidth < 641) {
        $scope.time = false;
        $scope.location = false;
        $scope.instructor = false;
        $scope.updated = false;
      }
      else if(newWidth < 1025) {
        $scope.time = true;
        $scope.location = true;
        $scope.instructor = false;
        $scope.updated = false;
      }
      else {
        $scope.time = true;
        $scope.location = true;
        $scope.instructor = true;
        $scope.updated = true;
      }
      $scope.initialized = true;
    }
    else {
      if(newWidth < 641) {
        if(!(oldWidth < 641)) {
          $scope.time = false;
          $scope.location = false;
          $scope.instructor = false;
          $scope.updated = false;
        }
      }
      else if(newWidth < 1025) {
        if(!(oldWidth < 1025 && oldWidth > 640)) {
          $scope.time = true;
          $scope.location = true;
          $scope.instructor = false;
          $scope.updated = false;
        }
      }
      else {
        $scope.time = true;
        $scope.location = true;
        $scope.instructor = true;
        $scope.updated = true;
      }
    }
  }

  $scope.$watch(
    function() { return $(window).width(); },
    responsiveTable
  );

  $(window).resize(function() {
    $scope.$apply();
  });

  $scope.init = function(id, course) {
    $http.get('/api/sections/'+id+'/'+course)
      .success(function(data) {
        $scope.sections = data;
        $scope.loading = false;
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  }

  $scope.loadAllData = function() {
    angular.forEach($scope.sections, function(section, key) {
      var ccn = section.ccn;
      $scope.loadData(key, ccn);
    });
  };

  $scope.loadData = function(index, ccn) {
    $scope.sections[index].loading = true;
    $http.get('/api/enrollment/'+ccn)
      .success(function(data) {
        $scope.sections[index].date = new Date().toLocaleString();
        $scope.sections[index].enroll = data.enroll;
        $scope.sections[index].enrollLimit = data.enrollLimit;
        $scope.sections[index].enrollment = data.enroll + '/' + data.enrollLimit;
        $scope.sections[index].waitlist = data.waitlist + '/' + data.waitlistLimit;
        if(data.enroll == data.enrollLimit) {
          $scope.sections[index].filled = true;
          $scope.sections[index].hide = $scope.hide;
        }
        $scope.sections[index].loading = false;
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  }

  $scope.toggleHide = function() {
    angular.forEach($scope.sections, function(section, key) {
      if(section.enroll != null && section.enrollLimit != null && section.enroll == section.enrollLimit) {
        section.hide = !$scope.hide;
      }
    });
  }
});