
var config = {};

// Application Information
config.app = {};
config.app.mode = {};
config.app.user = {};
config.app.errorUrl   = '/error';
config.app.mode.DEVELOPMENT = 'development';
config.app.mode.PRODUCTION = 'production';
config.app.mode.current = config.app.mode.DEVELOPMENT;

// HTTP server configuration
config.http = {};
config.http.port = (config.app.mode.current == config.app.mode.DEVELOPMENT ) ? 8080 : 8080;
config.http.enableSSL = false;

// Log files
config.logger = {};
config.logger.errorFile = __dirname + '/../logs/error.log';
config.logger.consoleFile = __dirname + '/../logs/console.log';
config.logger.maxFileSize = 1000000;
config.logger.maxFiles = 1;

config.databaseFileName = __dirname +  "/database.json";
config.bookmarksFileName = __dirname +  "/bookmarks.json";

config.databaseRecordSeprator = "||";
config.jsonFileSeprator = "|!@#$%^&*|";
config.bookmarkFileSeprator = "$$$";
config.bookmarkArrSeprator = "**";

config.JsonFilesDirectoryPath = "server/server/files/";
config.uploadedFilesPath  = "server/server/uploadedFiles/";

module.exports = config;