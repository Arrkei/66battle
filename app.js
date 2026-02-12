global.express = require("express");//
global.cors = require("cors");
global.http = require("http"); //.Server(express);
//global.https = require("https"); //.Server(express);
global.compression = require('compression');
global.fs = require('fs');
global.dateFormat = require("date-format-lite");
global.socket = require("socket.io"); //(http);
global.winston = require("winston");
global.logger = require("./utils/Logger.js");
global.message = require("./utils/Message")();
global.usersDB = require("./utils/UsersDB")();
global.serveStatic = require('serve-static');
global.ip = require('ip');
global.ipAddress = ip.address();
// global.SIO_HTTP_PORT = 3166;
// global.SIO_HTTPS_PORT = 1166;
// global.NETPORT = 8080;


var server = require('./index.js');
server();