// Reference to the module to be exported
readFile = module.exports = {};

readFile.setup = function( app ) {
  
  // Our logger for logging to file and console
  var config = require(__dirname + '/../config');

  // Our common file for functions
  var common = require(__dirname + '/common');

  var path = require('path');
  var formidable = require('formidable');
  var fs = require('fs');

  app.post('/api/deleteFile', function(req, res) {  
    
    console.log('Inside /api/deleteFile');
    var responseJson = {},
    isDeleted = false,
    deleteFileIndex = -1,
    fileObject = req.body,
    deleteJsonFileName = fileObject.uuid + '.json',
    extension = (fileObject.fileType == "Pdf Document") ? '.pdf' : '.txt',
    deleteFileName = fileObject.uuid + extension,
    filesArr = common.readFilesDataFromDb();

    for (var i = 0; i < filesArr.length; i++) {
      if (filesArr[i].uuid == fileObject.uuid) {
        isDeleted = true;
        deleteFileIndex = i;
        break;
      }
    };

    if (isDeleted) {        
      filesArr.splice(deleteFileIndex, 1);
      var text = common.writeDeleteFileDataToDatabase(filesArr);
      common.deleteFileEntryFromBookmark(fileObject.uuid);
      common.deleteJsonFileByName(deleteJsonFileName);
      common.deleteFileByName(deleteFileName);
      responseJson.status = 'OK';
      responseJson.message = 'File Deleted Successfully!!';
      responseJson.text = text;
    } else {
      responseJson.status = 'Fail';
      responseJson.message = 'File Not Found';
    }
    
    res.status(200).jsonp(responseJson);
    return;
  });

  app.post('/api/writeFileToDatabase', function(req, res) {
    
    console.log('Inside /api/writeFileToDatabase');
    
    var responseJson = {};
    var newFile = req.body.fileDetails;
    
    common.writeNewFileToDatabase(newFile);
    common.enterNewBookmarkForFile(newFile);
    common.createNewJsonFile(newFile.uuid);
    
    responseJson.status = 'OK';
    responseJson.message = 'New file record added to database successfully!!';
    res.status(200).jsonp(responseJson);
    return;
  });

  app.get('/api/readFiles', function(req, res) {
    
    console.log('Inside /api/readFiles');

    var responseJson = {};
    responseJson.status = 'OK';
    responseJson.filesData = common.readFilesDataFromDb();
    res.status(200).jsonp(responseJson);
    return;
  });


  app.get('/api/checkFilePresent/:fileName', function(req, res) {
    
    console.log('Inside /api/checkFilePresent');

    var fileName = req.params.fileName;
    var status = common.checkFilePresent(fileName);

    var responseJson = {};
    responseJson.status = status;
    res.status(200).jsonp(responseJson);
    return;
  });

  app.get('/api/getJsonFileContent/:fileName', function(req, res) {
    
    console.log('Inside /api/getJsonFileContent');

    var file = req.params.fileName;
    var responseJson = {};
    var fileText = common.readJsonFileContent(file);

    if (fileText != '') {
      responseJson.status = 'OK';
      responseJson.text = fileText;
    } else {
      responseJson.status = 'Fail';
      responseJson.text = 'No Text Found For this file';
    }      
    res.status(200).jsonp(responseJson);
    return;
  });

  app.post('/api/uploadFileToDir', function(req, res){

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // store all uploads in the /uploads directory
    form.uploadDir = path.join(__dirname, '/../uploadedFiles');

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name

    form.on('file', function(field, file) {
      fs.rename(file.path, path.join(form.uploadDir, file.name));
    });

    // log any errors that occur
    form.on('error', function(err) {
      res.end("FAIL! Error: "+err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
      res.end("OK");
    });

    // parse the incoming request containing the form data
    form.parse(req);

  });

  app.get('/api/writeFileDataToJson/:jsonFileName/:fileName/:fileType', function(req, res) {
    
    console.log('Inside /api/writeFileDataToJson');
    
    var responseJson = {};
    var jsonFileName = req.params.jsonFileName;
    var fileName = req.params.fileName;
    var type = req.params.fileType;
    
    if (type == '.pdf') {
      var status = common.readPdfFileAndSaveToJsonFile(fileName, jsonFileName);
      if (status == "OK") {
        responseJson.status = 'OK';
        res.status(200).jsonp(responseJson);
        return;
      }
    } else if (type == '.txt') {
      var status = common.readTextFileAndSaveToJsonFile(fileName, jsonFileName);
      if (status == "OK") {
        responseJson.status = 'OK';
        res.status(200).jsonp(responseJson);
        return;
      }
    }      
  });

  app.post('/api/bookmarkPage', function(req, res) {
    
    console.log('Inside /api/bookmarkPage');
    
    var responseJson = {};
    var data = req.body;
    
    var status = common.addPageToBookmark(data);
    
    if (status == "ALREADY_EXIST") {
      responseJson.status = 'ALREADY_EXIST';
      responseJson.message = 'This Page is already bookmarked';
      res.status(200).jsonp(responseJson);
      return;      
    } else {
      responseJson.status = 'OK';
      responseJson.message = 'Successfully bookmarked the page';
      res.status(200).jsonp(responseJson);
      return;
    }
  });

  app.get('/api/getBookmarks/:uuid', function(req, res) {
    
    console.log('Inside /api/getBookmarks');

    var uuid = req.params.uuid;
    var fs = require('fs');
    var responseJson = {};

    var data = common.getBookmarksByUUID(uuid);
    
    responseJson.status = 'OK';
    responseJson.message = 'Bookmarks get successfully';
    responseJson.bookmarks = data;
    res.status(200).jsonp(responseJson);
    return;

  });

  app.post('/api/removeBookmark', function(req, res) {
    
    console.log('Inside /api/removeBookmark');
    
    var responseJson = {};
    var data = req.body;
    
    common.removeBookmark(data);

    responseJson.status = 'OK';
    responseJson.message = 'Successfully remove bookmark';
    res.status(200).jsonp(responseJson);
    return;
    
  });
  
}
