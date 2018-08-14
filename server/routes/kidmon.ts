
import * as express from "express";
import {
    verifier
} from '../classes/verifier';
var fs = require('fs');
var util = require('util');
var path = require('path');
var dal = require("@nodulus/data");
var ObjectID = require("mongodb").ObjectID;
var logger = require('@nodulus/logs').logger;
const querystring = require('querystring');

var cache = require('@nodulus/cache');
class Route {

    public static setbarcode(req: express.Request, res: express.Response) {
        var result: any = {
            history: []
        }
        var pageSize = 5
        var kidid = req.query.id;
        var userid = req.query.userid;
        var index = req.params["index"];

        dal.connect(function (err: any, db: any) {
            db.collection("KIDMON_History").find({
                $query: {
                    "KIDID": {
                        "$eq": kidid
                    }
                }
            }).sort({
                "Date": -1
            }).skip((Math.abs(index) * pageSize) - pageSize).limit(pageSize).toArray(function (err: any, data: any) {
                result.history = data;

                res.json(result);
            });
        });
    }
    public static getHistory(req: express.Request, res: express.Response) {
        var result: any = {
            history: []
        }
        var pageSize = 5
        var kidid = req.params.kidid;
        var userid = req.query.userid;
        var index = req.params["index"] ? req.params["index"] : 1;

        dal.connect(function (err: any, db: any) {
            db.collection("KIDMON_History").find({
                $query: {
                    "KIDID": {
                        "$eq": kidid
                    }
                }
            }).sort({
                "Date": -1
            }).skip((Math.abs(index) * pageSize) - pageSize).limit(pageSize).toArray(function (err: any, data: any) {
                result.history = data;

                res.json(result);
            });
        });
    }

    public static kidmonPage(req: express.Request, res: express.Response) {

        res.render('kidmon', {title: 'KidMon™'});
    }

}

export function appRoute(app: express.Router) {
    app.route("/kidmon/setbarcode/").get(Route.setbarcode);
    app.route("/kidmon/").get(Route.kidmonPage);
    app.route("/kidmon/history/:kidid").get(Route.getHistory);

}