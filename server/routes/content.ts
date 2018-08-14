import * as express from "express";
import { verifier } from '../classes/verifier';
var fs = require('fs');
var util = require('util');
var path = require('path');
var dal = require("@nodulus/data");
var ObjectID = require("mongodb").ObjectID;
var logger = require('@nodulus/logs').logger;
const querystring = require('querystring');

var cache = require('@nodulus/cache');
export class Route {

    public static latestItems(req: express.Request, res: express.Response) {
        var result: any = { history: [], tabs: [], users: [] }
        var pageSize = 15;
        var tabid = req.query.tabid;
        var userid = req.query.userid;
        var index = req.params["index"];

        dal.connect(function (err: any, db: any) {
            db.collection("History").find({
                $query: {
                    "Configuration.Discovery": { "$eq": "public" },
                    "Configuration.Rating": { "$ne": "adult" }
                }
            }).sort({
                "Date": -1
            }).skip((Math.abs(index) * pageSize) - pageSize).limit(pageSize).toArray(function (err: any, data: any) {
                result.history = data;
                var tabset = [], userset: any = [], hashset: any = [];
                for (var i = 0; i < data.length; i++) {
                    tabset.push(ObjectID(data[i].TabId));
                    var hash = verifier.url2filename(data[i].Url);
                    hashset.push(hash);
                }

                var critArray: Array<any> = [{ _id: { "$in": tabset } },
                { "Configuration.Discovery": { "$eq": "public" } },
                { "Configuration.Rating": { "$ne": "adult" } }];


                if (tabid && tabid !== null) {
                    critArray.push({ "TabId": { "$eq": tabid } });
                }


                if (userid && userid !== null) {
                    critArray.push({ "UserId": { "$eq": userid } });
                }



                db.collection("Tabs").find({
                    "$and": critArray
                }, { Name: 1, UserId: 1 }).toArray(function (err: any, data: any) {
                    //dal.getSet(tabset, "Tabs", function (data) {
                    result.tabs = data;

                    var tobj: any = {};
                    for (var t = 0; t < data.length; t++) {
                        tobj[data[t]._id] = data[t];
                    }


                    for (var h = result.history.length - 1; h >= 0; h--) {
                        if (!tobj[result.history[h].TabId]) {
                            result.history.splice(h, 1);
                        }
                    }
                    for (var i = 0; i < data.length; i++) {
                        if (typeof (data[i].UserId) === "string") {
                            userset.push(ObjectID(data[i].UserId));
                        }
                        else {
                            for (var x = 0; x < data[i].UserId.length; x++) {
                                userset.push(ObjectID(data[i].UserId[x]));
                            }
                        }
                    }



                    db.collection("Metadata").find({
                        $query: {
                            "hash": {
                                $in: hashset
                            }
                        }
                    }).toArray(function (err: any, metadata: any) {
                        result.metadata = metadata;

                        db.collection("Users").find({ _id: { "$in": userset } }, { FirstName: 1, LastName: 1, Picture: 1 }).toArray(function (err: any, data: any) {
                            // dal.getSet(userset, "Users", function (data) {
                            result.users = data;
                            res.json(result);
                        });

                    });


                });
            });
        });
    }

    public static websearch(req: express.Request, res: express.Response) {
        logger.debug("search: ", req.query);
        var name = querystring.unescape(req.query.Name);

        //var elasticsearch = require('elasticsearch');
        //var client = new elasticsearch.Client({
        //    host: 'localhost:9200',
        //    log: 'trace'
        //});



        dal.connect(function (err: any, db: any) {
            var term = new RegExp(".*" + name + ".*", 'i');
            db.collection("History").find({
                $or: [{
                    "Title": {
                        '$regex': term
                    }
                },
                {
                    "Url": {
                        '$regex': term
                    }
                }],
                $and: [
                    {

                        "Discovery": {
                            '$ne': 'private'
                        }

                    }]
            }).limit(15)
                .toArray(function (err: any, arr: any) {
                    //merge results with tabs

                    var tabsArr = [];
                    var tabsObj: any = {};
                    arr.map(function (o: any) {
                        tabsObj[o.TabId] = o;
                    });


                    var searchResulttabs: any = [];
                    cache.get('Tabs', Object.keys(tabsObj), (tabs: any) => {
                        arr.map(function (o: any) {
                            if (tabs[o.TabId]) {
                                //o.Tab = tabs[o.TabId];
                                searchResulttabs.push({ '_id': o.TabId, 'Title': o.Title });
                            }
                        });


                        var users_for_tabs = [];
                        for (var tname in tabs) {
                            if (tabs[tname]) {
                                if (Array.isArray(tabs[tname].UserId))
                                    users_for_tabs.concat(tabs[tname].UserId);
                                else
                                    users_for_tabs.push(tabs[tname].UserId);
                            }
                        }


                        cache.get('Users', users_for_tabs, (users: any) => {

                            for (var userid in users) {
                                var user = users[userid];
                                user = {
                                    "_id": user._id,
                                    "FirstName": user.FirstName,
                                    "LastName": user.LastName,
                                    "Picture": user.Picture,
                                };
                            };







                            res.status(200).json({
                                result: {
                                    tabs: searchResulttabs,
                                    users: users,
                                    items: arr
                                }
                            });
                        }, true);

                    }, true);
                });

        });
    }
}

export function appRoute(app: express.Router) {
    app.route("/content/latestItems/:index").get(Route.latestItems);
    app.route("/content/websearch").get(Route.websearch);
}