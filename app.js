"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@methodus/server");
const user_1 = require("./server/controllers/user");
const socketManager_1 = require("./server/classes/socketManager");
var cache = require('@nodulus/cache');
var config = require('@nodulus/config').config;
if (config.appSettings.env) {
    for (var key in config.appSettings.env) {
        process.env[key] = config.appSettings.env[key];
    }
}
global.appRoot = __dirname;
const socket_1 = require("./server/classes/socket");
global.api_token = "DA113CED-66D3-4BFD-9EE2-873848CE000A";
let serverConfig = new server_1.MethodusConfig();
serverConfig.run("express", { port: process.env.PORT || 8020 });
serverConfig.use(user_1.User, "Local", "express");
const server = new server_1.Server(Number(process.env.PORT) || 8020).configure(serverConfig).start();
var routes = require('./server/routes/index');
var cors = require('cors');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var url = require('url');
var querystring = require('querystring');
global.socketManager = new socketManager_1.SocketManager();
var moment = require('moment');
var http = require('http');
var app = require('@nodulus/core');
var activeport = config.appSettings.port;
if (process.env.PORT !== undefined)
    activeport = process.env.PORT;
var socket = require('socket.io');
var io = socket.listen(app.server);
var SocketUse = new socket_1.Socket(io);
app.use(compression());
app.set('view engine', 'ejs');
app.set('views', './server/views');
app.use(app.static(path.join(__dirname, './public')));
app.use(app.static(path.join(__dirname, './node_modules')));
app.use(app.static(path.join(__dirname, './bower_components')));
routes(app);
console.log(`
     ██╗██╗   ██╗███╗   ██╗████████╗ █████╗ ███████╗ ██████╗ ███╗   ██╗██╗     ██╗███╗   ██╗███████╗
     ██║██║   ██║████╗  ██║╚══██╔══╝██╔══██╗██╔════╝██╔═══██╗████╗  ██║██║     ██║████╗  ██║██╔════╝
     ██║██║   ██║██╔██╗ ██║   ██║   ███████║███████╗██║   ██║██╔██╗ ██║██║     ██║██╔██╗ ██║█████╗  
██   ██║██║   ██║██║╚██╗██║   ██║   ██╔══██║╚════██║██║   ██║██║╚██╗██║██║     ██║██║╚██╗██║██╔══╝  
╚█████╔╝╚██████╔╝██║ ╚████║   ██║   ██║  ██║███████║╚██████╔╝██║ ╚████║███████╗██║██║ ╚████║███████╗
 ╚════╝  ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝
                                                                                                    

`);
console.log("\n");
console.log("_______________________________________________________________________________");
console.log("|.............................................................................|");
console.log("|.............................................................................|");
console.log("|.............................................................................|");
console.log("|.............................                  ..............................|");
console.log("|............................. juntas is online ..............................|");
console.log("|.............................      " + activeport + "        ..............................|");
console.log("|.............................................................................|");
console.log("|.............................................................................|");
console.log("|_____________________________________________________________________________|");
global.Rooms = {};
module.exports = app;
//# sourceMappingURL=app.js.map