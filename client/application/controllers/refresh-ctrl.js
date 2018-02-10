app.controller("refreshCtrl",['$scope', '$state', 'Api', '$timeout', '$rootScope', function($scope, $state, Api, $timeout, $rootScope) {
	
	$timeout(function() {
		$state.go('home');
    }, 200);
}]);