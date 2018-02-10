app.controller("uploadFilesCtrl",['$scope', '$state', 'Api', '$timeout', '$rootScope', function($scope, $state, Api, $timeout, $rootScope) {
	
	if ($rootScope.readOnce) {
		var jsonFileName = $rootScope.jsonFileName;
	    var fileName = $rootScope.fileName;
	    var fileType = $rootScope.fileType;

	    $timeout(function() {
			Api.get('/writeFileDataToJson/'+jsonFileName+"/"+fileName+"/"+fileType).then(function(response) {
			    if(response.status == "OK") {
			      $timeout(function() {
					$state.go('home');
		          }, 2000);
			    }
			});
	    }, 2000);
		
		$rootScope.readOnce = false;
	}
}]);