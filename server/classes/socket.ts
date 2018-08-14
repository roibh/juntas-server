
import { DataLogic } from "./datalogic";
import { thumbler } from "./thumbler";
import { verifier } from "./verifier";

var logger = require('@nodulus/logs').logger;

export class Socket {
    constructor(io: any) {
        var express = require('express');
        var router = express.Router();
        var fs = require('fs');
        var util = require('util');
        var path = require('path');
        var dal = require('@nodulus/data');
        var config = require('@nodulus/config').config;
        var ObjectID = require("mongodb").ObjectID;
        var moment = require('moment');
        var thumbler = require('./thumbler.js');
        var verifier = require('./verifier.js');



        var logic = new DataLogic();

        io.on('connection', function (socket: any) {

            socket.on('disconnect', function () {
                console.log('user disconnect', socket.userid);
                global.socketManager.takeOffline(socket.userid);
                logic.getTabsForUsers(socket.userid)
                    .then(function (items:any) {
                        for (var i = 0; i < items.length; i++) {
                            var tid = items[i]._id.toString();
                            if (global.Rooms[tid] !== undefined && global.Rooms[tid].online && global.Rooms[tid].online[socket.userid]) {
                                delete global.Rooms[tid].online[socket.userid];
                            }
                        }
                    });
            });

            socket.on('juntas connect', function (data:any) {



                socket.userid = data.UserId;
                logger.info("user connecting: ", data.UserId);
                global.socketManager.identifySocket(socket, data.UserId);
                if (!data.ano) {
                    var tabid = data.TabId;
                    logic.getTabsForUsers(data.UserId)
                        .then(function (items:any) {

                            global.socketManager.addToRooms(socket, items);
                        });
                    var query = "SELECT * FROM Tabs WHERE Followers in @Followers";






                    var pushObject = {
                        "Date": new Date(),
                        "UserId": data.UserId,
                        "Url": data.Url
                    };

                    dal.pushObject(tabid, "Tabs", "History", pushObject, function (data:any) {


                        io.to(tabid).emit("tabs:navigate", {
                            "TabId": tabid,
                            "Map": pushObject
                        });

                    });
                }
            });


            global.socketPlugins = {};
            var plugins = config.appSettings.plugins;
            plugins.forEach((plugin_name:string) => {
                var objClass = require("./plugins/" + plugin_name);
                if (!global.socketPlugins[socket.id])
                    global.socketPlugins[socket.id] = {};

                global.socketPlugins[socket.id][plugin_name] = new objClass.default(socket, io);
                logger.debug("loaded plugin: ", plugin_name);


            }, this);




        });
    }

}
