global.express = require("express");//
global.cors = require("cors");
global.http = require("http"); //.Server(express);
// global.https = require("https"); //.Server(express);
global.compression = require('compression');
global.fs = require('fs');
global.dateFormat = require("date-format-lite");
global.socket = require("socket.io"); //(http);
global.winston = require("winston");
global.logger = require("./utils/Logger.min.js");
global.message = require("./utils/Message.min.js")();
global.usersDB = require("./utils/UsersDB.min.js")();
global.serveStatic = require('serve-static');
global.ip = require('ip');
global.ipAddress = ip.address();

var server = require('./index.min.js');
server();