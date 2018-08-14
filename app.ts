"use strict";
/// <reference path="../typings/main.d.ts" />

import { MethodType, ServerType, Server, MethodusConfig } from '@methodus/server';

import { User } from './server/controllers/user';

import { SocketManager } from "./server/classes/socketManager";
var cache = require('@nodulus/cache');
var config = require('@nodulus/config').config;



if (config.appSettings.env) {
    for (var key in config.appSettings.env) {
        process.env[key] = config.appSettings.env[key];
    }
}


global.appRoot = __dirname;
import { Socket } from './server/classes/socket';
global.api_token = "DA113CED-66D3-4BFD-9EE2-873848CE000A";


let serverConfig = new MethodusConfig();
serverConfig.run(ServerType.Express, { port: process.env.PORT || 8020 });

serverConfig.use(User, MethodType.Local, ServerType.Express);

const server = new Server(Number(process.env.PORT) || 8020).configure(serverConfig).start();


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

//var config = require('./server/classes/config.js').config;



global.socketManager = new SocketManager();
var moment = require('moment');

var http = require('http');
var app = require('@nodulus/core');
var activeport = config.appSettings.port;
if (process.env.PORT !== undefined)
    activeport = process.env.PORT;
//var server = http.createServer(app).listen(activeport);
var socket = require('socket.io');
var io = socket.listen(app.server);

//var redis = require('socket.io-redis');
//io.adapter(redis({ host: '192.168.99.100', port: 32768 }));

var SocketUse = new Socket(io);
app.use(compression());
app.set('view engine', 'ejs');
app.set('views', './server/views');
// app.use(app.static(path.join(__dirname, './public')));
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
