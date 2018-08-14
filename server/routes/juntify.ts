/*
::::::'##:'##::::'##:'##::: ##:'########::::'###:::::'######::
:::::: ##: ##:::: ##: ###:: ##:... ##..::::'## ##:::'##... ##:
:::::: ##: ##:::: ##: ####: ##:::: ##:::::'##:. ##:: ##:::..::
:::::: ##: ##:::: ##: ## ## ##:::: ##::::'##:::. ##:. ######::
'##::: ##: ##:::: ##: ##. ####:::: ##:::: #########::..... ##:
 ##::: ##: ##:::: ##: ##:. ###:::: ##:::: ##.... ##:'##::: ##:
. ######::. #######:: ##::. ##:::: ##:::: ##:::: ##:. ######::
:......::::.......:::..::::..:::::..:::::..:::::..:::......:::
*/

import * as express from "express";
var fs = require('fs');
var util = require('util');
var path = require('path');
var dal = require("@nodulus/data");
var moment = require('moment');
var ObjectID = require("mongodb").ObjectID;
var router = express.Router();
class Route {
    public static share(req: express.Request, res: express.Response) {
        var tabid = req.query.j;
        var userid = req.query.u;
        var query = "SELECT * FROM Users WHERE _id=@_id";
        dal.query(query, { "_id": userid }, function (userdata: any) {
            if (userdata.length > 0)
                userdata = userdata[0];
            var query = "SELECT * FROM Tabs WHERE _id=@_id";
            dal.query(query,
                {
                    "_id": tabid
                }, function (data: any) {
                    if (data.length == 0)
                        res.status(404).end();
                    else {
                        var obj = data[0];
                        //ObjectID(tabid)
                        dal.connect(function (err: any, db: any) {
                            db.collection("History").findOne({
                                $query: {
                                    "TabId": tabid
                                },
                                $orderby: {
                                    Date: -1
                                }
                            }, function (err: any, result: any) {
                                if (result === null)
                                    result = {
                                        "Url": "http://www.google.com"
                                    };
                                // var text = fs.readFileSync(global.appRoot + '\\public\\redirect.html', 'utf8');
                                // text = text.replace("embedUrl", result.Url);
                                // text = text.replace("juntasTabId", tabid);
                                var modelData = { "Url": result.Url, "embedUrl": "join?u=" + req.query.u + "&j=" + req.query.j, "juntasTabId": tabid, "tab": obj, "user": userdata };
                                res.render('redirect', modelData);
                                // res.send(text);
                            });
                        });
                    }
                });
        });
    }

    public static join(req: express.Request, res: express.Response) {
        var tabid = req.query.j;
        var userid = req.query.u;

        var finalObject = {};
        var userId = req.query.userId;
        var tabId = req.query._id;


        dal.getSingle("Tabs", tabId, function (data: any) {
            if (data !== null && data.UserId !== userId) {


                if (data !== null) {
                    if (data.Followers === undefined)
                        data.Followers = [];

                    if (data.Followers.indexOf(userId) == -1) {
                        data.Followers.push(userId)
                        dal.pushObject(tabId, "Tabs", "Followers", userId, function (opdata: any) {

                        });
                    }

                    dal.connect(function (err: any, db: any) {
                        db.collection("History").findOne({
                            $query: {
                                "TabId": tabid
                            },
                            $orderby: {
                                Date: -1
                            }
                        }, function (err: any, result: any) {
                            if (result === null)
                                result = {
                                    "Url": "http://www.google.com"
                                };

                            res.redirect(result);


                        });
                    });


                }
            }
            else {
                res.json({ "status": 0 });
            }
        })
    }


    public static entry(req: express.Request, res: express.Response) {
        var modelData = {};
        res.render('entry', modelData);
    };
    public static start(req: express.Request, res: express.Response) {
        var tabid = req.query.j;
        var userid = req.query.u;
        var query = "SELECT * FROM Tabs WHERE _id=@_id";
        dal.query(query, {
            "_id": tabid
        }, function (data: any) {
            if (data.length == 0)
                res.status(404).end();
            else {
                var obj = data[0];
                //ObjectID(tabid)
                dal.connect(function (err: any, db: any) {
                    db.collection("History").findOne({
                        $query: {
                            "TabId": tabid
                        },
                        $orderby: {
                            Date: -1
                        }
                    }, function (err: any, result: any) {
                        if (result === null)
                            result = {
                                "Url": "http://www.google.com"
                            };
                        var modelData = { "embedUrl": result.Url, "juntasTabId": tabid };
                        res.render('start', modelData);
                    });
                });
            }
        });
    }
    public static end(req: express.Request, res: express.Response) {
        var tabid = req.query.j;
        var userid = req.query.u;
        var query = "SELECT * FROM Tabs WHERE _id=@_id";
        dal.query(query, {
            "_id": tabid
        }, function (data: any) {
            if (data.length == 0)
                res.status(404).end();
            else {
                var obj = data[0];
                //ObjectID(tabid)
                dal.connect(function (err: any, db: any) {
                    db.collection("History").findOne({
                        $query: {
                            "TabId": tabid
                        },
                        $orderby: {
                            Date: -1
                        }
                    }, function (err: any, result: any) {
                        if (result === null)
                            result = {
                                "Url": "http://www.google.com"
                            };
                        var text = fs.readFileSync(global.appRoot + '\\public\\redirect.html', 'utf8');
                        text = text.replace("embedUrl", result.Url);
                        text = text.replace("juntasTabId", tabid);
                        res.send(text);
                    });
                });
            }
        });
    }
}
export function appRoute(app: express.Router) {
    app.route("/").get(function (req, res) {

        res.redirect("index.html");
        ///app/popup.html

    });

    app.route("/juntify/share").get(Route.share);
    app.route("/juntify/join").get(Route.join);
    app.route("/juntify/entry").get(Route.entry);
    app.route("/juntify/start").get(Route.start);
    app.route("/juntify/end").get(Route.end);


}