import * as express from "express";

var fs = require('fs');
var util = require('util');
var path = require('path');
var dal = require("@nodulus/data");
var moment = require('moment');
var ObjectID = require("mongodb").ObjectID;
class MonitorRoute {


    public static rooms(req: express.Request, res: express.Response) {
        res.json(global.Rooms);

    }

    public static room(req: express.Request, res: express.Response) {
        if (global.Rooms[req.query.tabid]) {
            var room = global.Rooms[req.query.tabid].online;
            return res.json(room);
        }
        res.json({});

    }

    public static tabs(req: express.Request, res: express.Response) {

        var query = "SELECT * FROM Tabs";
        dal.getCollection("Tabs", function (tab: any) {
            res.json(tab);
        });



    }



}


export function appRoute(app: express.Router) {
    app.route("/monitor/rooms").get(MonitorRoute.rooms);
    app.route("/monitor/room").get(MonitorRoute.room);

    app.route("/monitor/tabs").get(MonitorRoute.tabs);

}

