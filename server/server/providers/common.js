/**
 * This module is responsible to handle common functions
 * 
 */

// Setup the module
common = module.exports = {};

// Get the configurations	
var config = require(__dirname + '/../config');

 /**
 * Funcation name: createNewJsonFile
 * This function will create new json file with data of uploaded file and named by guid.
 */
 common.createNewJsonFile = function(name) {
 	
	var fs = require('fs');
	var fileName = config.JsonFilesDirectoryPath + name + '.json';
	fs.writeFile(fileName, '', 'utf8');
 }

 /**
 * Funcation name: checkFilePresent
 * This function will check that file is already present with this name or not.
 */
 common.checkFilePresent = function(fileName) {
 	
	var arr = common.readFilesDataFromDb();
	var status = 'OK';
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].fileName == fileName) {
			status = 'ALREADY_EXIST';
			break;
		}
	};
	return status;	
 }


 /**
 * Funcation name: readFilesDataFromDb
 * This function will read all the files from database and return in object form.
 */
 common.readFilesDataFromDb = function() {
	
	var obj = common.readDatabaseFile();
	var fileArr = common.convertObjToArray(obj, config.databaseRecordSeprator);
	return fileArr;
 }

 /**
 * Funcation name: readDatabaseFile
 * This function will read the database file text and return.
 */
 common.readDatabaseFile = function() {
 	
	var fs = require('fs');
	var text = fs.readFileSync(config.databaseFileName, 'utf8');
	return text;
 }

 /**
 * Funcation name: readJsonFileContent
 * This function will read the content of the json file and return.
 */
 common.readJsonFileContent = function(fileName) {
 	
	var fs = require('fs');
	var obj = fs.readFileSync(config.JsonFilesDirectoryPath + fileName, 'utf8');

	var fileContent = obj.split(config.jsonFileSeprator);
	return fileContent;
 }

 /**
 * Funcation name: convertObjToArray
 * This function will take obj as input and convert it into array and return.
 */
 common.convertObjToArray = function(obj, seprator) {
 	
	var array = obj.split(seprator);
	var fileArr = [];

	array.forEach(function(element) {

	    if(element != '') {
	    	var object = JSON.parse(element, (key, value) => {
				return value;
			});
			fileArr.push(object);
	    }
	});
	return fileArr;
 }

 /**
 * Funcation name: writeNewFileToDatabase
 * This function will add the details of new file to the database.
 */
 common.writeNewFileToDatabase = function(data) {
	
	var fs = require('fs');
	var jsonData = JSON.stringify(data),
	database = common.readDatabaseFile();

	if(!database) {
		fs.writeFile(config.databaseFileName, jsonData, 'utf8');  
	} else {
		var data = config.databaseRecordSeprator + jsonData;
		fs.appendFile(config.databaseFileName, data, 'utf8');
	}
 }

/**
 * Funcation name: arrayToString
 * This function will write the updated files data after deleting file to database file.
 */
 common.arrayToString = function(filesArr, seprator) {
 	
	var databaseText = JSON.stringify(filesArr);	
    databaseText = databaseText.replace('[','');
    databaseText = databaseText.replace(']','');
    databaseText = databaseText.split('},').join('}'+seprator);
	return databaseText;
 }

 /**
 * Funcation name: textArrayToString
 * This function will write the updated files data after deleting file to database file.
 */
 common.textArrayToString = function(filesArr, seprator) {
 	
	var databaseText = JSON.stringify(filesArr);	
    databaseText = databaseText.replace('[','');
    databaseText = databaseText.replace(']','');
    databaseText = databaseText.split(',').join(seprator);
	return databaseText;
 }

/**
 * Funcation name: writeDeleteFileDataToDatabase
 * This function will write the updated files data after deleting file to database file.
 */
 common.writeDeleteFileDataToDatabase = function(filesArr) {
 	
	var fs = require('fs');
	var databaseText = common.arrayToString(filesArr, config.databaseRecordSeprator);
	fs.writeFile(config.databaseFileName, databaseText, 'utf8');
	return databaseText;
 }

 /**
 * Funcation name: convertBookmarkArrToString
 * This function will update the data of the bookmark file.
 */
 common.convertBookmarkArrToString = function(bookmarkArr) {
 	
 	var bookmarkString = JSON.stringify(bookmarkArr);	
    bookmarkString = bookmarkString.replace('[','');
    bookmarkString = bookmarkString.replace(']','');
    bookmarkString = bookmarkString.split(',').join(config.bookmarkArrSeprator);
    bookmarkString = bookmarkString.replace(/"/g,'');
 	return bookmarkString;
 }

 /**
 * Funcation name: convertBookmarkFileArrToString
 * This function will update the data of the bookmark file.
 */
 common.convertBookmarkFileArrToString = function(bookmarkFileArr) {
 	
 	var bookmarkFileString = JSON.stringify(bookmarkFileArr);	
    bookmarkFileString = bookmarkFileString.replace('[','');
    bookmarkFileString = bookmarkFileString.replace(']','');
    bookmarkFileString = bookmarkFileString.split('},').join('}'+config.bookmarkFileSeprator);
 	return bookmarkFileString;
 }

 /**
 * Funcation name: deleteJsonFileByName
 * This function will delete the json files from the files directory by file name.
 */
 common.deleteJsonFileByName = function(filename) {

 	var fs = require('fs');
 	var filePath = config.JsonFilesDirectoryPath + filename;
	if (fs.statSync(filePath).isFile()) {
		fs.unlinkSync(filePath);
		console.log('Json File Deleted Successfully!!');
	}
 }

 /**
 * Funcation name: deleteFileByName
 * This function will delete the uploaded origional file from the files directory by file name.
 */
 common.deleteFileByName = function(filename) {

 	var fs = require('fs');
 	var filePath = config.uploadedFilesPath + filename;
	if (fs.statSync(filePath).isFile()) {
		fs.unlinkSync(filePath);
		console.log('Origional File Deleted Successfully!!');
	}
 }

 /**
 * Funcation name: readTextFileAndSaveToJsonFile
 * This function will read text data from the file and save it to json file.
 */
 common.readTextFileAndSaveToJsonFile = function(fileName, jsonFileName) {
	
	var fs = require('fs');
 	var readFilePath = config.uploadedFilesPath + fileName;
 	var writeFilePath = config.JsonFilesDirectoryPath + jsonFileName;
	if (fs.statSync(readFilePath).isFile()) {
		var text = fs.readFileSync(readFilePath, 'utf8');
		/*var textInArray = text.match(/.{1,500}/g);
		var jsonFileText = "";
		textInArray.forEach(function (element) {
			var invertedCommas = '';
			if (element != '') {
				if (jsonFileText == "") {
					jsonFileText +=  invertedCommas + element + invertedCommas;	
				} else {
					jsonFileText += config.jsonFileSeprator + invertedCommas + element + invertedCommas;
				}				
			}
		});*/
		fs.writeFile(writeFilePath, text, 'utf8');
		return "OK";
	}
 }

 /**
 * Funcation name: readPdfFileAndSaveToJsonFile
 * This function will read pdf data from the file and save it to json file.
 */
 common.readPdfFileAndSaveToJsonFile = function(fileName, jsonFileName) {
	
	var readFilePath = config.uploadedFilesPath + fileName,
		writeFilePath = config.JsonFilesDirectoryPath + jsonFileName;

	var nodeUtil = require("util"),
        PFParser = require("pdf2json/pdfParser");

    var pdfParser = new PFParser();

    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );

    pdfParser.on("pdfParser_dataReady", pdfData => {
        common.extractStringDataFromParseInput(writeFilePath, pdfData);
    });

    pdfParser.loadPDF(readFilePath);
	return "OK";
 }

/**
 * Funcation name: extractStringDataFromParseInput
 * This function will extract the data from parseObject and save it to json file.
 */
common.extractStringDataFromParseInput = function(writeFilePath, pdfData) {

	var PagesArr = pdfData.formImage.Pages;
	var fs = require('fs');
	for (var i = 0; i < PagesArr.length; i++) {
		
		var fileText = fs.readFileSync(writeFilePath, 'utf8');	
		var	pageString = "",
			TextsArr = PagesArr[i].Texts,
			appendableData = "";
		
		for (var j = 0; j < TextsArr.length; j++) {
			pageString += TextsArr[j].R[0].T + " ";
		};

		pageString = unescape(pageString);
		pageString = pageString.replace(/â/g, "'");

		if (fileText == '') {
			appendableData = pageString;
		} else {
			appendableData = config.jsonFileSeprator + pageString;
		}		
		fs.appendFileSync(writeFilePath, appendableData, 'utf8');
	};
}

 /**
 * Funcation name: addPageToBookmark
 * This function will mark the page as bookmark.
 */
 common.addPageToBookmark = function(data) {

 	var fs = require('fs');
	var obj = fs.readFileSync(config.bookmarksFileName, 'utf8');

	var fileArr = common.convertObjToArray(obj, config.bookmarkFileSeprator);

	for (var i = 0; i < fileArr.length; i++) {
      if (fileArr[i].uuid == data.uuid) {
        
        var bookmarkArr = common.convertObjToArray(fileArr[i].bookmarks, config.bookmarkArrSeprator);
      	var alreadyMarked = false;
      	for (var j = 0; j < bookmarkArr.length; j++) {
	      if (bookmarkArr[j] == data.page) {
	        alreadyMarked = true;
	      }
	    };

	    if (alreadyMarked) {
	    	return "ALREADY_EXIST";
	    } else {
	      	bookmarkArr.push(data.page);
	      	var bookmarkString = common.convertBookmarkArrToString(bookmarkArr);
	      	fileArr[i].bookmarks = bookmarkString;
	      	var bookmarkFileString = common.convertBookmarkFileArrToString(fileArr);
	      	fs.writeFile(config.bookmarksFileName, bookmarkFileString, 'utf8');
	      	return "OK";
	    }
      }
    };
 }

 /**
 * Funcation name: getBookmarksByUUID
 * This function will return the array form of bookmarks by uuid.
 */
 common.getBookmarksByUUID = function(uuid) {
 	
	var fs = require('fs');
	var obj = fs.readFileSync(config.bookmarksFileName, 'utf8');

	var fileArr = common.convertObjToArray(obj, config.bookmarkFileSeprator),
		isFound = false,
		bookmarkArr = [];

	for (var i = 0; i < fileArr.length; i++) {
      if (fileArr[i].uuid == uuid) {
		isFound = true;
        bookmarkArr = common.convertObjToArray(fileArr[i].bookmarks, config.bookmarkArrSeprator);
      }
    };

    if (isFound) {
    	return bookmarkArr;
    } else {
    	return [];
    }
 }

 /**
 * Funcation name: removeBookmark
 * This function will remove the page from bookmark.
 */
 common.removeBookmark = function(data) {

 	var fs = require('fs');
	var obj = fs.readFileSync(config.bookmarksFileName, 'utf8');

	var fileArr = common.convertObjToArray(obj, config.bookmarkFileSeprator);

	for (var i = 0; i < fileArr.length; i++) {
      if (fileArr[i].uuid == data.uuid) {
        
        var bookmarkArr = common.convertObjToArray(fileArr[i].bookmarks, config.bookmarkArrSeprator);
      	
      	var index = bookmarkArr.indexOf(data.bookmark);
      	bookmarkArr.splice(index, 1);      	
      	var bookmarkString = common.convertBookmarkArrToString(bookmarkArr);
      	fileArr[i].bookmarks = bookmarkString;
      	var bookmarkFileString = common.convertBookmarkFileArrToString(fileArr);
      	fs.writeFile(config.bookmarksFileName, bookmarkFileString, 'utf8');
      }
    };
 }


 /**
 * Funcation name: enterNewBookmarkForFile
 * This function will enter the entry to the bookmarks database with uuid of file.
 */
 common.enterNewBookmarkForFile = function(data) {
	
	var fs = require('fs');
	var obj = fs.readFileSync(config.bookmarksFileName, 'utf8');

	if (obj == '') {
		var newFileString = '{"uuid":"'+data.uuid+'","bookmarks":""}';
		fs.writeFile(config.bookmarksFileName, newFileString, 'utf8');
	} else {
		var newFileString = '{"uuid":"'+data.uuid+'","bookmarks":""}';
		obj += config.bookmarkFileSeprator + newFileString;
		fs.writeFile(config.bookmarksFileName, obj, 'utf8');
	}
 }

 /**
 * Funcation name: deleteFileEntryFromBookmark
 * This function will remove the entry of file from bookmark.
 */
 common.deleteFileEntryFromBookmark = function(uuid) {

 	var fs = require('fs');
	var obj = fs.readFileSync(config.bookmarksFileName, 'utf8');

	var fileArr = common.convertObjToArray(obj, config.bookmarkFileSeprator);

	for (var i = 0; i < fileArr.length; i++) {
      if (fileArr[i].uuid == uuid) {
        
        fileArr.splice(i, 1);
      	var bookmarkFileString = common.convertBookmarkFileArrToString(fileArr);
      	fs.writeFile(config.bookmarksFileName, bookmarkFileString, 'utf8');
      }
    };
 }