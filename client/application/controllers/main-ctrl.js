app.controller("mainCtrl",['$scope', '$state', 'Api', '$timeout', '$rootScope', function($scope, $state, Api, $timeout, $rootScope) {

    $scope.filesArray = [];
    $scope.scrollText = "";$scope.partialScrollText = "";
    $scope.scrollSpeed = 5;
    $scope.selectedFile = "";
    $scope.uploadedFile = "";
    $scope.readingFileUUID = "";
    $scope.bookmarkMessage = "Page bookmarked successfully!!";
    $scope.showBookmarkMessage = false;
    $scope.disableSlowButton = true;
    $scope.disableFastButton = false;
    $scope.isFileEndScrolling = false;
    $scope.showBookmarkNgClass = "hideBookMarkMessage";
    $scope.bookmarks = {};
    $scope.timeOutArrForPages = [];
    $scope.isStoped = false;
    $scope.showEmptyFileError = false;

    $scope.checkPage = function() {
      if ($scope.moveToPage.pageNumber == undefined || $scope.moveToPage.pageNumber == null) {
        $scope.moveToPage.pageNumber = 1;
      }
    }
    //For Pages
    $scope.currentReadingPage = 1;
    $scope.currentScrollingSpeedWPM = 50;
    $scope.totalPages = 1;
    $scope.selectedFileContent = "";
    $scope.disablePrevButton = true;
    
    $scope.moveToPage = {};
    $scope.moveToPage.pageNumber = 1;

    $scope.startDelayDate = "";
    $scope.endDelayDate = "";

    $scope.hideErrorMessage = function() {
      $scope.showSelectFileError = false;
      $scope.showFileFormatsError = false;
      $scope.showAlreadyExistFileError = false;
    }

    $scope.hideErrorMessage();

    $scope.getAllPdfFiles = function() {
      Api.get('/readFiles').then(function(response) {
        if(response.status == "OK") {
          $scope.filesArray = response.filesData;
        }
      });
    }

    $scope.getAllPdfFiles();

    $scope.readFile = function(file) {
    	
      $scope.moveToPage.pageNumber = 1;
      if($scope.totalPages != 1 && $scope.currentReadingPage != "") {
        $scope.bookmarkPage();
      }

      mqr = [];      
      $scope.selectedFile = "";
      $scope.scrollText = "";
      $scope.currentReadingPage = 1;
      $scope.currentScrollingSpeedWPM = 50;
      $scope.totalPages = 1;
      $scope.selectedFile = file;      
      $scope.isFileEndScrolling = false;
      $scope.loading = true;
      $scope.disableNextButton = false;
      $scope.disableSlowButton = true;
      $scope.disableFastButton = false;
      $scope.readingFileUUID = file.uuid;

      var fileName = file.uuid + '.json';
      
      showIconImgByType(file.fileType);

      Api.get('/getJsonFileContent/'+fileName).then(function(response) {
        if(response.status == "OK") {
          $timeout(function() {

            $scope.selectedFileContent = response.text;
            createArrayForPageTimeout($scope.selectedFileContent);
            //send 1 as to read the data from page no 1 to all
            $scope.scrollText = startScrollingFromPage($scope.selectedFileContent, 1);
            startTimeOutPageArrayFunction();
            $scope.loading = false;
            getBookmarksOfFile();

            $timeout(function() {
              var marqueSpeed = getSpeedByWPM($scope.currentScrollingSpeedWPM);
              new mq('m1');
              mqRotate(mqr, marqueSpeed);
            }, 100);
          }, 1000);
        } else {
          $scope.showEmptyFileError = true;
          $timeout(function() {
              $scope.showEmptyFileError = false;
              $scope.loading = false;
              $scope.selectedFile = '';
          }, 6000);
        }
      });
    }

    var getBookmarksOfFile =  function() {
      Api.get('/getBookmarks/'+$scope.readingFileUUID).then(function(response) {
        if(response.status == "OK") {
          $scope.bookmarks = response.bookmarks;
        }
      });
    }

    $scope.deleteFile = function(file) {
    	
      Api.post('/deleteFile', file).then(function(response) {
        if(response.status == 'OK') {
          var fileIndex = $scope.filesArray.indexOf(file);
          $scope.filesArray.splice(fileIndex, 1);
        }
      });
    }

    $scope.closeReading = function() {
      if($scope.totalPages != 1) {
        $scope.bookmarkPage();
      }
      mqr = [];
      $state.go('refresh');      
    }

    $scope.saveUploadedFile = function() {

      if($scope.uploadedFile) {        
        $scope.hideErrorMessage();

        if($scope.uploadedFile.type == "application/pdf" || $scope.uploadedFile.type == "text/plain") {
          $scope.hideErrorMessage();

          var fileName = $scope.uploadedFile.name;
          Api.get('/checkFilePresent/'+fileName).then(function(response) {
            if(response.status == 'OK') {
              var postRequestData = {};
              var fileType = ($scope.uploadedFile.type == "application/pdf") ? 'Pdf Document' : 'Text Document';
              var extension = ($scope.uploadedFile.type == "application/pdf") ? '.pdf' : '.txt';  
              postRequestData.fileDetails = {
                'uuid': generateGuid(),
                'fileName': $scope.uploadedFile.name,
                'fileType': fileType,
                'size': $scope.uploadedFile.size,
                'uploadedDate': new Date()
              }
              var readFileName = postRequestData.fileDetails.uuid + extension;
              var readJsonFileName = postRequestData.fileDetails.uuid + '.json';
              $rootScope.fileName = readFileName;
              $rootScope.jsonFileName = readJsonFileName;
              $rootScope.readOnce = true;
              $rootScope.fileType = extension;

              Api.post('/writeFileToDatabase', postRequestData).then(function(response) {
                if(response.status == 'OK') {
                  //upload the file to the directory
                  postFileToServer($scope.uploadedFile, readFileName);
                }
              });

            } else {
              $scope.hideErrorMessage();
              $scope.showAlreadyExistFileError = true;
            }
          });
        } else {
          $scope.hideErrorMessage();
          $scope.showFileFormatsError = true;
        }
      } else {
        $scope.hideErrorMessage();
        $scope.showSelectFileError = true;
      }
    }

    $scope.fileChangeEvent = function(element) {
      $scope.uploadedFile = element.files[0];
    }

    $scope.changePage = function(type) {
      
      var currentPageNo = parseInt($scope.currentReadingPage),
          totalPages = parseInt($scope.totalPages);

      if (type == 'prev') {
        var chnagePageNo = currentPageNo - 1;
        if (chnagePageNo < 1) {
          chnagePageNo = 1;
        }
        $scope.currentReadingPage = chnagePageNo;
        $scope.scrollText = startScrollingFromPage($scope.selectedFileContent, chnagePageNo);        
        changePageText($scope.scrollText);        
        $timeout.cancel($scope.promise);
        startTimeOutPageArrayFunction();
      } else if (type == 'next') {
        var chnagePageNo = currentPageNo + 1;
        if (chnagePageNo > totalPages) {
          chnagePageNo = totalPages;
        }
        $scope.currentReadingPage = chnagePageNo;
        $scope.scrollText = startScrollingFromPage($scope.selectedFileContent, chnagePageNo);
        changePageText($scope.scrollText);
        $timeout.cancel($scope.promise);
        startTimeOutPageArrayFunction();
        if (chnagePageNo == $scope.totalPages) {
          $timeout(function() {
            $scope.isFileEndScrolling = true;
          }, $scope.timeOutArrForPages[chnagePageNo - 1] + 10000);          
        }
      } else if (type == 'move') {

        var moveToPageNumber = parseInt($scope.moveToPage.pageNumber);
        $scope.currentReadingPage = moveToPageNumber;
        $scope.scrollText = startScrollingFromPage($scope.selectedFileContent, moveToPageNumber);
        changePageText($scope.scrollText);
        $timeout.cancel($scope.promise);
        startTimeOutPageArrayFunction();
        if (moveToPageNumber == $scope.totalPages) {          
          $timeout(function() {
            $scope.isFileEndScrolling = true;
          }, $scope.timeOutArrForPages[moveToPageNumber - 1] + 10000);
        }
      } else if (type) {

        var moveToPageNumber = parseInt(type);
        $scope.currentReadingPage = moveToPageNumber;
        $scope.scrollText = startScrollingFromPage($scope.selectedFileContent, moveToPageNumber);
        changePageText($scope.scrollText);
        $timeout.cancel($scope.promise);
        startTimeOutPageArrayFunction();
        if (moveToPageNumber == $scope.totalPages) {
          $timeout(function() {
            $scope.isFileEndScrolling = true;
          }, $scope.timeOutArrForPages[moveToPageNumber - 1] + 10000);
        }        
      }
      disableNextPrevButtons();
    }

    $scope.bookmarkPage = function() {
      
      var data = {
        uuid: $scope.readingFileUUID,
        page: $scope.currentReadingPage
      };
      Api.post('/bookmarkPage', data).then(function(response) {
        if(response.status == "OK") {
          
          $scope.bookmarkMessage = "Page bookmarked successfully!!";
          $scope.showBookmarkNgClass = "showBookMarkMessage";
          $scope.showBookmarkMessage = true;
          getBookmarksOfFile();
          $timeout(function() {
            $scope.showBookmarkNgClass = "hideBookMarkMessage";
            $timeout(function() {
              $scope.showBookmarkMessage = false;
            }, 1000);
          }, 2000);

        } else if(response.status == "ALREADY_EXIST") {
          
          $scope.bookmarkMessage = "Page already bookmarked.";
          $scope.showBookmarkNgClass = "showBookMarkMessage";
          $scope.showBookmarkMessage = true;
          $timeout(function() {
            $scope.showBookmarkNgClass = "hideBookMarkMessage";
            $timeout(function() {
              $scope.showBookmarkMessage = false;
            }, 1000);
          }, 2000);
        }
      });
    }

    $scope.removeBookmark = function(bookmark) {
      
      var data = {
        bookmark: bookmark,
        uuid: $scope.readingFileUUID
      };

      Api.post('/removeBookmark', data).then(function(response) {
        if(response.status == "OK") {
          var index = $scope.bookmarks.indexOf(bookmark);
          $scope.bookmarks.splice(index, 1);
        }
      });

    };

    $scope.roundOffFileSizeToKB = function (size) {
      var sizeInKb = size / 1024;
      sizeInKb = Math.ceil(sizeInKb);
      return sizeInKb;
    }

    $scope.changeSpeed = function (speed) {
      
      if (speed == 'fast') {
        
        var wpm = $scope.currentScrollingSpeedWPM + 50;
        if (wpm > 300) {
          $scope.currentScrollingSpeedWPM = 300;
        } else {
          $scope.currentScrollingSpeedWPM = wpm;
        }
        
        if (wpm == 200) {
          clearTimeout(mqr[0].TO);
          mqRotate(mqr, 1);
          mqRotate(mqr, 10);
        } else if (wpm == 250) {
          clearTimeout(mqr[0].TO);
          $timeout(function() {
            clearTimeout(mqr[0].TO);
            mqRotate(mqr, 1);
            mqRotate(mqr, 8);
          }, 50);
        } else if (wpm == 300) {
          clearTimeout(mqr[0].TO);
          $timeout(function() {
            clearTimeout(mqr[0].TO);
            mqRotate(mqr, 1);
            mqRotate(mqr, 5);
          }, 50);
        } else {
          clearTimeout(mqr[0].TO);
          keepScrolling();
        }
        updateTimeoutArr();

      } else if (speed == 'slow') {

        var wpm = $scope.currentScrollingSpeedWPM - 50;
        if (wpm < 50) {
          $scope.currentScrollingSpeedWPM = 50;
        } else {
          $scope.currentScrollingSpeedWPM = wpm;
        }
        
        if (wpm == 200) {
          clearTimeout(mqr[0].TO);
          $timeout(function() {
            clearTimeout(mqr[0].TO);
            mqRotate(mqr, 1);
            mqRotate(mqr, 10);            
          }, 50);
        } else if (wpm == 250) {
          clearTimeout(mqr[0].TO);
          $timeout(function() {
            clearTimeout(mqr[0].TO);
            mqRotate(mqr, 1);
            mqRotate(mqr, 8);
          }, 50);
        } else {
          clearTimeout(mqr[0].TO);
          $timeout(function() {
            clearTimeout(mqr[0].TO);
            $timeout(function() {
              clearTimeout(mqr[0].TO);
              keepScrolling();
            }, 25);
          }, 25);
        }        
        updateTimeoutArr();
      }
      disableFastSlowButton();
    }

    var keepScrolling = function() {
      var speed = getSpeedByWPM($scope.currentScrollingSpeedWPM);
      clearTimeout(mqr[0].TO);
      mqRotate(mqr, speed);      
    }

    var updateTimeoutArr =  function () {
      $scope.timeOutArrForPages = [];
      createArrayForPageTimeout($scope.selectedFileContent);
      $timeout.cancel($scope.promise);
      startTimeOutPageArrayFunction();
    }

    $scope.resumeScrolling = function () {
      
      var speed = getSpeedByWPM($scope.currentScrollingSpeedWPM);

      if ($scope.currentScrollingSpeedWPM == 200) {
        clearTimeout(mqr[0].TO);
        mqRotate(mqr, 1);
        mqRotate(mqr, 10);
      } else if ($scope.currentScrollingSpeedWPM == 250) {
        clearTimeout(mqr[0].TO);
        $timeout(function() {
          clearTimeout(mqr[0].TO);
          mqRotate(mqr, 1);
          mqRotate(mqr, 5);
        }, 50);
      } else if ($scope.currentScrollingSpeedWPM == 300) {
        clearTimeout(mqr[0].TO);
        $timeout(function() {
          clearTimeout(mqr[0].TO);
          mqRotate(mqr, 1);
          mqRotate(mqr, 1);
        }, 50);
      } else {
        clearTimeout(mqr[0].TO);
        mqRotate(mqr, speed);
      }
    }
    $scope.stopScrolling = function () {
      $scope.isStoped = true;
      clearTimeout(mqr[0].TO);
      $timeout(function() {
        clearTimeout(mqr[0].TO);
      }, 100);
    }

    $scope.restartScrolling = function () {
      
      $scope.currentReadingPage = 1;
      $scope.disableNextButton = false;
      $scope.disablePrevButton = true;
      $scope.isFileEndScrolling = false;
      $scope.scrollText = startScrollingFromPage($scope.selectedFileContent, 1);
      startTimeOutPageArrayFunction();
      restartMarque($scope.scrollText);
    }    

    $scope.showSelectedFileName = function() {
      return $scope.selectedFile.fileName.replace(/_/g,' ');
    }

    var generateGuid = function () {
      
      var delim = "-";
      function S4() {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
    };

    var postFileToServer = function (file, jsonFileName) {

      var formData = new FormData();
      formData.append('upload', file, jsonFileName);
      
      $.ajax({
        url: '/api/uploadFileToDir',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
          if (data == "OK") {
            $state.go('uploadFiles');
          }
        }
      });
    }

    var disableNextPrevButtons = function () {

      if (parseInt($scope.currentReadingPage) == 1) {
        $scope.disablePrevButton = true;  
        $scope.disableNextButton = false;
      } else if ($scope.currentReadingPage == $scope.totalPages) {
        $scope.disableNextButton = true;
        $scope.disablePrevButton = false;
      } else {
        $scope.disablePrevButton = false;
        $scope.disableNextButton = false;
      }
    }

    var disableFastSlowButton = function () {

      if (parseInt($scope.currentScrollingSpeedWPM) == 50) {
        $scope.disableSlowButton = true;
        $scope.disableFastButton = false;
      } else if ($scope.currentScrollingSpeedWPM == 300) {
        $scope.disableSlowButton = false;
        $scope.disableFastButton = true;
      } else {
        $scope.disableSlowButton = false;
        $scope.disableFastButton = false;
      }
    }

    var showIconImgByType = function(type) {
      if (type == 'Pdf Document') {
        $scope.showPdfImage = true;
        $scope.showTxtImage = false;
      } else {
        $scope.showPdfImage = false;
        $scope.showTxtImage = true;
      }
    };

    var createArrayForPageTimeout = function(array) {

      for (var i=0; i < array.length; i++) {
        var text = array[i].replace(/\s+/g, " ");
        var wordsInPage = text.split(' ').length;
        var wpm = getactualWpmBySpeedWPM($scope.currentScrollingSpeedWPM);
        var wordsInSec = $scope.currentScrollingSpeedWPM / 60;
        var timeout = Math.round(wordsInPage / wpm) * 1000 * 60;
        if ( timeout == 0) {
          var totalSeconds = Math.ceil(wordsInPage / wordsInSec);
          timeout = totalSeconds * 1000;
        }
        $scope.timeOutArrForPages.push(timeout);
      }
    }


    var startScrollingFromPage = function (array, pageNumber) {

      $scope.totalPages = array.length;
      if ($scope.totalPages == $scope.currentReadingPage) { $scope.disableNextButton = true; }

      var pageNo = parseInt(pageNumber) -1;
      var fullString = "";

      if (array.length >= 20) {
        
        $scope.isLargePdfFile = true;
        for (var i=0; i < 20; i++) {
          if (pageNo >= array.length) {
            fullString += ' ... End Of File ... ';
            break;
          }
          fullString += array[pageNo];
          pageNo ++;
        }
      } else {        
        $scope.isLargePdfFile = false;
        for (var i=pageNo; i < array.length ; i++) {
          
          fullString += array[i];

          if (i == array.length -1) {
            fullString += ' ... End Of File ... ';
          }
        }
      }      
      $scope.lastEndPageTimoutNo = pageNo;
      return fullString;
    }

    var startTimeOutPageArrayFunction = function () {
      
      var indexOfCuurentPageTimeout = $scope.currentReadingPage - 1;
      $scope.promise = $timeout(function() {
        
        var pageNumber = $scope.currentReadingPage + 1;        
        
        if(pageNumber <= $scope.totalPages) {
          
          $scope.currentReadingPage = pageNumber;
          if ( $scope.isLargePdfFile && parseInt($scope.lastEndPageTimoutNo - $scope.currentReadingPage) <= 1) {
            if($scope.totalPages - $scope.currentReadingPage >= 20) {
              $scope.scrollText = startScrollingFromPage($scope.selectedFileContent, $scope.currentReadingPage);
              changePageText($scope.scrollText);              
            }
          } 
          startTimeOutPageArrayFunction();
        } else if (pageNumber > $scope.totalPages) {
          $timeout.cancel($scope.promise);
          $timeout(function() {
            $scope.isFileEndScrolling = true;
          }, $scope.timeOutArrForPages[pageNumber - 1 ] + 10000);          
        }
      }, $scope.timeOutArrForPages[indexOfCuurentPageTimeout]);
    }

    var getSpeedByWPM = function(wpm) {
    
      switch(wpm) {
        case 50:
          return 20;

        case 100:
          return 10;

        case 150:
          return 1;
      }
    }

    var getactualWpmBySpeedWPM = function(wpm) {
    
      switch(wpm) {
        case 50:
          return 35;

        case 100:
          return 70;

        case 150:
          return 135;

        case 200:
          return 180;

        case 250:
          return 210;

        case 300:
          return 250;
      }
    }

}]);
