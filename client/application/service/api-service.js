app.service('Api', ['$http', '$q', function($http, $q) {
    function Api() {

        this.timeOut = 60000;
        this.prefix = '/api';
        //for localhost
        this.host = 'http://localhost:8080' ;
        //for live
        //this.host = '' ;      
    };

    /**
     * Post
     *
     * @params:
     * data: Object
     **/
    Api.prototype.post = function(url, data) {
        
        var deferred = $q.defer();
        
        $http.post(this.host + this.prefix + url, data)
            .success(function(data, status, headers, config) {
                deferred.resolve(data);  
            })
            .error(function(data, status, headers, config) {
                console.log('an error has occured', data, status);
                // execute callback function
                deferred.reject(data);
            });
        return deferred.promise;
    };

    /**
     * Get
     *
     * @params:
     **/
    Api.prototype.get = function(url) {
        
        var deferred = $q.defer();
        
        $http.get(this.host + this.prefix +url)
            .success(function(data, status, headers, config) {
                deferred.resolve(data);  
            })
            .error(function(data, status, headers, config) {
                console.log('an error has occured', data, status);
                // execute callback function
                deferred.reject(data);
            });
        return deferred.promise;
    };
        
    return new Api();
}]);