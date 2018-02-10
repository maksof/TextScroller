define({
  // Here paths are set relative to `/source/js` folder
  paths: {
    'angular'       : '/libs/angular/angular',
    'angular-route'     : '/libs/angular-route/angular-route'
  },

  shim: {
    'angular-route' : ['angular']
  }
});