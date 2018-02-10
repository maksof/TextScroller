app.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
        
        // home page
        .state('home', {
            url: '/home',
            templateUrl: '/pages/home.html',
            controller: 'mainCtrl'
        })

        // login page
        .state('uploadFiles', {
            url: '/upload-files',
            templateUrl: '/pages/uploadFiles.html',
            controller: 'uploadFilesCtrl'
        })    

        // login page
        .state('refresh', {
            url: '/refresh',
            templateUrl: '/pages/uploadFiles.html',
            controller: 'refreshCtrl'
        })    
        
}); 