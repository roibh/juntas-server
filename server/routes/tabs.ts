
import * as express from "express";
import { verifier } from '../classes/verifier';
var thumbler = require('../classes/thumbler.js');
var cache = require('@nodulus/cache');
var util = require('util');
var fs = require('fs');
var path = require('path');
var dal = require("@nodulus/data");
var moment = require('moment');
//var verifier = require('../classes/verifier.js');
var ObjectID = require("mongodb").ObjectID;
var thumbler = require('../classes/thumbler.js');
var mkdirp = require('mkdirp');
var logger = require('@nodulus/logs').logger;



class Route {
 

    public static deletegroup(req: express.Request, res: express.Response) {
        logger.debug("deletegroup: ", req.body._id);
        if (!req.body) return res.sendStatus(400);
        var finalObject = {};
        dal.deleteCollection("Tabs", req.body._id, function (data: any) {
            res.json({
                "result": "ok"
            });
        });
    };

    public static unsubscribefollowers(req: express.Request, res: express.Response) {
        logger.debug("unsubscribefollowers: ", req.body._id);
        if (!req.body) return res.sendStatus(400);
        var finalObject = {};
        dal.getSingle("Tabs", req.body._id, function (data: any) {
            if (data.UserId !== req.body.userId) {
                data.Followers.splice(data.Followers.indexOf(req.body.userId), 1);
                var query = "INSERT INTO Tabs";
                dal.query(query, data, function (tab: any) {
                    res.json(data);
                });
            }
        })
    }


    public static subscribefollowers(req: express.Request, res: express.Response) {
        logger.debug("subscribefollowers: ", req.body);
        if (!req.body) return res.sendStatus(400);
        var finalObject = {};
        var userId = req.body.userId;
        var tabId = req.body._id;
        dal.getSingle("Tabs", tabId, (data: any) => {
            if (data !== null && data.UserId !== userId) {
                if (data !== null) {
                    if (data.Followers === undefined)
                        data.Followers = [];

                    if (data.Followers.indexOf(userId) == -1) {
                        data.Followers.push(userId)
                        dal.pushObject(tabId, "Tabs", "Followers", userId, (opdata: any) => {
                            return res.json({
                                "Followers": data.Followers
                            });
                        });
                    }
                    else {
                        res.json({
                            "Followers": data.Followers
                        });
                    }
                }
            }
            else {
                res.json({
                    "status": 0
                });
            }
        })
    }





    public static fillfollowers(req: express.Request, res: express.Response) {

        logger.debug("fillfollowers: ", req.body);
        if (!req.body) return res.sendStatus(400);
        var finalObject: any = {};
        dal.getSingle("Tabs", req.body._id, function (data: any) {
            dal.getSet(data.Followers, "Users", function (data: any) {
                for (var i = 0; i < data.length; i++) {
                    delete data[i].Password;
                    delete data[i].Email;
                    finalObject[data[i]._id] = data[i];
                }
                res.json(finalObject);
            });
        })
    }

    public static tabs(req: express.Request, res: express.Response) {
        logger.debug("tabs: ", req.query);
        if (!req.query) return res.sendStatus(400);
        var query = "SELECT * FROM Tabs WHERE _id=@_id";
        dal.getSingle("Tabs", req.query._id, function (tab: any) {
            res.json(tab);
        });
    }





    public static find(req: express.Request, res: express.Response) {
        logger.debug("find: ", req.query);
        dal.connect((err: any, db: any) => {
            db.collection('History').find({
                'Url': req.query.url, 'Configuration.Discovery': 'public'
            }).toArray((err: any, history: any) => {
                if (history.length > 0) {
                    var tabsIdArr = history.map((item: any) => { return ObjectID(item.TabId); });
                    db.collection('Tabs').find({ _id: { "$in": tabsIdArr } }, { 'Name': 1, 'Description': 1 }).toArray((err: any, tabs: any) => {

                        res.json({ history: history, tabs: tabs });
                    });
                } else {
                    res.json([]);
                }
            });
        });

        //var query = "SELECT * FROM History WHERE Url=@Url AND Configuration.Discovery=@discovery AND Configuration.Rating@rating";
        //dal.query(query, { Url: req.query.url, discovery: 'public', rating: 'all' }, function (history: any) {

        //    if (history.length > 0) {
        //        var tabs = history.map(function (item) { return item.TabId });
        //        dal.getSet(tabs, function (tabSet) {
        //            res.json(history);
        //        });
        //    }

        //    res.json(history);
        //});
    };



    public static annotations(req: express.Request, res: express.Response) {
        logger.debug("annotations: ", req.query);
        var finalObject = { annotations: Array, users: {} }

        if (!req.query) return res.sendStatus(400);

        var actionGuid = thumbler.url2filename(req.query.url);

        dal.connect(function (err: any, db: any) {
            db.collection("Annotation").find({
                $query: {
                    "TabId": req.query._id,
                    "hash": actionGuid
                }
            }).limit(20).toArray(function (err: any, data: any) {
                finalObject.annotations = data;
                var userids: Array<string> = [];
                data.forEach((item: any) => {
                    // if (!finalObject.users[item.UserId]) {
                    userids.push(item.UserId);
                    // }
                });
                cache.get('Users', userids, (userdata: any) => {
                    finalObject.users = userdata;
                    res.json(finalObject);
                }, true);
            });
        });
    }

    public static fillmytab(req: express.Request, res: express.Response) {
        logger.debug("fillmytab: ", req.query);

        if (!req.query) return res.sendStatus(400);
        var query = "SELECT * FROM Tabs WHERE _id=@_id";
        var tabid = req.query._id;
        cache.get('Tabs', tabid, (tab: any) => {
            //dal.getSingle("Tabs", req.query._id, function (tab: any) {
            var finalObject = {};

            var userids = tab.Followers;
            if (!userids.indexOf) {
                userids = [];
                for (var ukey in tab.Followers) {
                    userids.push(ukey);
                }
            }

            cache.get('Users', userids, (data: any) => {
                //dal.getSet(tab.Followers, "Users", function (data: any) {
                tab.Followers = {};
                for (var i = 0; i < data.length; i++) {
                    delete data[i].Password;
                    delete data[i].Email;
                    tab.Followers[data[i]._id] = data[i];
                    if (global.Rooms[tabid] && global.Rooms[tabid].online)
                        tab.Followers[data[i]._id].online = global.Rooms[tabid].online[data[i]._id];
                }
                dal.connect(function (err: any, db: any) {
                    db.collection("Comments").find({
                        $query: {
                            "TabId": req.query._id
                        }
                    }).sort({
                        "Date": -1
                    }).limit(20).toArray(function (err: any, data: any) {
                        tab.Comments = data;
                        db.collection("History").find({
                            $query: {
                                "TabId": req.query._id
                            }
                        }).sort({
                            "Date": -1
                        }).limit(10).toArray(function (err: any, data: any) {
                            tab.History = data;
                            var hashArr: any = [];
                            var tabDictionary: any = {};
                            for (var i = 0; i < tab.History.length; i++) {
                                if (tab.History[i].Url) {
                                    var hash = verifier.url2filename(tab.History[i].Url);
                                    hashArr.push(hash);
                                    tabDictionary[hash] = tab.History[i];
                                }

                            }
                            //    global.cache.get('Metadata', tab.Followers, (data: any) => {
                            db.collection("Metadata").find({
                                $query: {
                                    "hash": {
                                        $in: hashArr
                                    }
                                }
                            }, {
                                    title: 1,
                                    hash: 1,
                                    description: 1,
                                    Likes: {
                                        $elemMatch: {
                                            TabId: req.query._id
                                        }
                                    }
                                }).toArray(function (err: any, metadata: any) {
                                    for (var i = 0; i < metadata.length; i++) {
                                        tabDictionary[metadata[i].hash].Likes = metadata[i].Likes;
                                    }
                                    tab.History = [];
                                    for (var hash in tabDictionary) {
                                        tab.History.push(tabDictionary[hash]);
                                    }
                                    res.json(tab);
                                });
                        });
                    });
                })
            });
        });
    }



    public static history(req: express.Request, res: express.Response) {



        if (!req.params) return res.sendStatus(400);

        var tabid = req.params["tabid"];
        var index = req.params["index"];

        dal.connect(function (err: any, db: any) {
            var tab: any = {};
            db.collection("History").find({
                $query: {
                    "TabId": tabid
                }
            }).sort({
                "Date": -1
            }).skip(Math.abs(index) * 10).limit(10).toArray(function (err: any, data: any) {
                tab.History = data;
                var hashArr: any = [];
                var tabDictionary: any = {};
                for (var i = 0; i < tab.History.length; i++) {
                    if (tab.History[i].Url) {
                        var hash = verifier.url2filename(tab.History[i].Url);
                        hashArr.push(hash);
                        tabDictionary[hash] = tab.History[i];
                    }

                }
                db.collection("Metadata").find({
                    $query: {
                        "hash": {
                            $in: hashArr
                        }
                    }
                }, {
                        title: 1,
                        hash: 1,
                        description: 1,
                        Likes: {
                            $elemMatch: {
                                TabId: tabid
                            }
                        }
                    }).toArray(function (err: any, metadata: any) {
                        for (var i = 0; i < metadata.length; i++) {
                            tabDictionary[metadata[i].hash].Likes = metadata[i].Likes;
                        }
                        tab.History = [];
                        for (var hash in tabDictionary) {
                            tab.History.push(tabDictionary[hash]);
                        }
                        res.json(tab);
                    });
            });
        });


    }

    public static updatetab(req: express.Request, res: express.Response) {
        logger.debug("tabsconfiguration: ", req.body);
        if (!req.body) return res.sendStatus(400);
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}"; //returnJSONResults("", "");//JSON.stringify(req.body);
        var query = "UPDATE Tabs SET Configuration=@Configuration where _id=@_id";
        dal.query(query, req.body, function (tab: any) {
            cache.expire("Tabs", tab._id);
            res.json(tab);
        });
        // user.login(email, password,   function (user) { 
        // 
        //        if (user.error !== undefined ) return res.sendStatus(404);
        //        
        //       return res.json(user);
        //     
        //      
        //     });
    }

    public static newtab(req: express.Request, res: express.Response) {
        //global.logger.debug("newtab: ", req.body);
        if (!req.body) return res.sendStatus(400);

        var jsonVersion = "{}";
        var obj = req.body;

        if (obj._id) {
            var query = "UPDATE Tabs SET Image=@Image, Description=@Description, Configuration=@Configuration WHERE _id=@_id";



            if (obj.Image.base64) {
                var actionGuid = obj._id;
                var dateKey = moment().format("MM_YYYY");
                var filepathbase = dateKey + '/' + actionGuid + ".jpg";
                // filepathbase = 'https://juntas.s3.amazonaws.com/' + filepathbase;
                var imagetTempPath = path.join('temp', dateKey, actionGuid + "_tmp.jpg");
                var base64Data = obj.Image.base64;
                mkdirp(path.join('temp', dateKey), (err: any) => {
                    if (err) console.error(err);

                    require("fs").writeFile(imagetTempPath, base64Data, 'base64', function (err: any) {
                        thumbler.upload_s3(imagetTempPath, dateKey, actionGuid + '.jpg', "image/jpg", null).then(() => {
                            console.log('all is well');
                        }).catch((error: any) => {
                        });
                    });
                });
            }


            dal.query(query, {
                "_id": obj._id,
                "Configuration": obj.Configuration,
                "Description": obj.Description,
                "Image": filepathbase
            }, function (tab: any) {
                if (tab && tab.length > 0)
                    cache.expire("Tabs", tab[0]._id);
                res.json({});
            });
            return;
        }

        var comment = obj.Comments[0];
        var history = obj.History[0];
        delete obj.Comments;
        delete obj.History;


        dal.connect(function (err: any, db: any) {
            if (obj.UniquePair) {
                db.collection("Tabs").find({ UniquePair: { $all: obj.UniquePair } }).toArray(function (err: any, result: any) {
                    if (result.length > 0) {
                        var tab = result[0];
                        tab.Url = history.Url;
                        if (history) {

                            logger.debug("verify : ", history.Url);
                            verifier.verify(tab, (metadata: any) => {

                                var actionGuid = thumbler.url2filename(tab.Url);
                                thumbler.capture(history, actionGuid);
                                var filepathbase = moment().format("MM_YYYY") + "/" + actionGuid + ".jpg";
                                history.Thumb = filepathbase;
                                var pushObject = { "Date": new Date(), "UserId": history.UserId, "Url": history.Url, "Thumb": filepathbase, "TabId": history.TabId };

                                if (!result[0].History)
                                    result[0].History = [];
                                result[0].History.push(pushObject);
                                tab.map = [pushObject];

                                var query = "INSERT INTO History";
                                dal.query(query, pushObject, function (historyresult: any) {
                                    dal.query("UPDATE Tabs SET Url=@Url, map=@map WHERE _id=@_id", { Url: history.Url, _id: tab._id, map: tab.map }, function (tabresult: any) {
                                        res.json(result[0]);
                                    });
                                });
                            });
                        }
                    }
                    else {
                        var query = "INSERT INTO Tabs";
                        dal.query(query, req.body, function (tab: any) {
                            tab = tab.result.upserted[0];
                            var tabid = tab._id.toString();
                            comment.TabId = tabid;
                            if (history)
                                history.TabId = tabid;
                            var query = "INSERT INTO Comments";
                            dal.query(query, comment, function (tab: any) { });

                            tab.Comments = [comment];

                            if (history) {
                                var actionGuid = thumbler.url2filename(history.Url);
                                thumbler.capture(tab.Url, actionGuid);
                                var filepathbase = moment().format("MM_YYYY") + "/" + actionGuid + ".jpg";
                                history.Thumb = filepathbase;
                                //var pushObject = { "Date": new Date(), "UserId": data.UserId , "Url": data.Url, "Thumb": filepathbase, "TabId": tabid };
                                tab.History = [history];
                                var query = "INSERT INTO History";
                                dal.query(query, history, function (tab: any) {
                                    res.json(tab);
                                });

                            } else {
                                res.json(tab);
                            }



                        });
                    }


                });


            }
            else {

                var query = "INSERT INTO Tabs";
                dal.query(query, req.body, function (tab: any) {

                    tab = tab.result.upserted[0];
                    var tabid = tab._id.toString();
                    comment.TabId = tabid;

                    if (history)
                        history.TabId = tabid;
                    var query = "INSERT INTO Comments";

                    dal.query(query, comment, function (tab: any) { });

                    if (tab.Url !== undefined) {

                        if (history) {


                            var actionGuid = thumbler.url2filename(tab.Url);
                            thumbler.capture(tab.Url, actionGuid);
                            var filepathbase = moment().format("MM_YYYY") + "/" + actionGuid + ".jpg";
                            history.Thumb = filepathbase;
                            //var pushObject = { "Date": new Date(), "UserId": data.UserId , "Url": data.Url, "Thumb": filepathbase, "TabId": tabid };
                            tab.History = [history];
                            var query = "INSERT INTO History";
                            dal.query(query, history, function (tab: any) { });

                        }

                    }
                    tab.Comments = [comment];
                    res.json(tab);
                });
            }




        })


    }


    public static followedfeeds(req: express.Request, res: express.Response) {
        logger.debug("followedfeeds: ", req.query);
        if (!req.body) return res.sendStatus(400);
        var jsonVersion = "{}";

        dal.connect((err: any, db: any) => {
            db.collection("Tabs").find({ "Followers": { "$in": [req.query.UserId] } }, { "Name": 1, "Followers": 1, "UserId": 1 })
                .toArray((err: any, items: any) => {

                    var users_for_tabs = items.map(function (a: any) {
                        if (typeof (a.UserId) == "string")
                            return ObjectID(a.UserId);
                        else
                            return a.UserId;
                    })
                    db.collection("Users").find({
                        "_id": {
                            $in: users_for_tabs
                        }
                    }).toArray((err: any, arr: any) => {

                        users_for_tabs = arr.map(function (a: any) {
                            return {
                                "FirstName": a.FirstName,
                                "LastName": a.LastName,
                                "Name": a.FirstName + " " + a.LastName,
                                "UserId": a._id,
                                "Picture": a.Picture
                            };
                        });
                        var usersRepo: any = {};
                        for (var i = 0; i < users_for_tabs.length; i++) {
                            usersRepo[users_for_tabs[i].UserId] = users_for_tabs[i];


                        }
                        for (var i = 0; i < items.length; i++) {
                            items[i].User = usersRepo[items[i].UserId];
                        }


                        res.json({
                            items: items
                        });

                    });

                });


        });



        // Convert our form input into JSON ready to store in Couchbase
        //returnJSONResults("", "");//JSON.stringify(req.body);
        //var query = "SELECT * FROM Tabs WHERE Followers in @Followers";
        //dal.query(query, {
        //    "Followers": [req.query.UserId]
        //}, function (items: any) {

        //    //add the leading users


        //    dal.connect(function (err, db) {

        //    });
        //});
        // user.login(email, password,   function (user) { 
        // 
        //        if (user.error !== undefined ) return res.sendStatus(404);
        //        
        //       return res.json(user);
        //     
        //      
        //     });
    }


    public static feeds(req: express.Request, res: express.Response) {
        logger.debug("feeds: ", req.body);
        if (!req.body) return res.sendStatus(400);

        dal.connect(function (err: any, db: any) {
            db.collection("Tabs").find({
                $and: [{
                    "UserId": req.body.UserId
                }, {
                    "Configuration.Discovery": {
                        "$ne": "private"
                    }
                }]
            }).toArray(function (err: any, arr: any) {

                var x = arr;
                var tabs = arr.map(function (a: any) {
                    return {
                        "Name": a.Name,
                        "_id": a._id,
                        "Description": a.Description,
                        "Followers": a.Followers,
                        UserId: a.UserId
                    };
                })

                var users_for_tabs = arr.map(function (a: any) {
                    if (typeof (a.UserId) == "string")
                        return ObjectID(a.UserId);
                    else
                        return a.UserId;
                })

                db.collection("Users").find({
                    "_id": {
                        $in: users_for_tabs
                    }
                }).toArray(function (err: any, arr: any) {

                    users_for_tabs = arr.map(function (a: any) {
                        return {
                            "FirstName": a.FirstName,
                            "LastName": a.LastName,
                            "Name": a.FirstName + " " + a.LastName,
                            "UserId": a._id,
                            "Picture": a.Picture
                        };
                    });

                    res.json({
                        items: tabs
                    });
                });
            });
        });
    }







    public static search(req: express.Request, res: express.Response) {
        logger.debug("search: ", req.body);
        var name = req.body.Name;
        dal.connect(function (err: any, db: any) {
            var term = new RegExp(".*" + name + ".*", 'i');
            db.collection("Users").find({
                $or: [{
                    "FirstName": {
                        '$regex': term
                    }
                }, {
                    "LastName": {
                        '$regex': term
                    }
                }, {
                    "Email": {
                        '$regex': term
                    }
                }]
            }).toArray(function (err: any, arr: any) {
                var x = arr;
                var users = arr.map(function (a: any) {
                    return {
                        "Name": a.Email,
                        "UserId": a._id,
                        "Picture": a.Picture
                    };
                })
                db.collection("Tabs").find({
                    $or: [{
                        "Name": {
                            '$regex': term
                        }
                    }, {
                        "Description": {
                            '$regex': term
                        }
                    },],
                    $and: [{ "Configuration.Discovery": { "$eq": "public" } },
                    { "Configuration.Rating": { "$ne": "adult" } }]
                }).toArray(function (err: any, arr: any) {
                    var x = arr;
                    var tabs = arr.map(function (a: any) {
                        return {
                            "Name": a.Name,
                            "_id": a._id,
                            "Description": a.Description,
                            "Followers": a.Followers,
                            UserId: a.UserId
                        };
                    })

                    var users_for_tabs = arr.map(function (a: any) {
                        if (typeof (a.UserId) == "string")
                            return ObjectID(a.UserId);
                        else
                            return a.UserId;
                    })

                    db.collection("Users").find({
                        "_id": {
                            $in: users_for_tabs
                        }
                    }).toArray(function (err: any, arr: any) {

                        users_for_tabs = arr.map(function (a: any) {
                            return {
                                "FirstName": a.FirstName,
                                "LastName": a.LastName,
                                "Name": a.FirstName + " " + a.LastName,
                                "UserId": a._id,
                                "Picture": a.Picture
                            };
                        });


                        res.status(200).json({
                            result: {
                                users: users,
                                tabs: tabs,
                                users_for_tabs: users_for_tabs
                            }
                        });
                    })
                })
            })


        });


    }






    public static metadata(req: express.Request, res: express.Response) {
        if (!req.query.url) return res.sendStatus(400);
        dal.connect((error: any, db: any) => {
            var hash = verifier.url2filename(req.query.url);
            db.collection("Metadata").find({
                hash: hash
            }).toArray(function (err: any, result: any) {
                res.json(result[0]);
            });
        });
    }


}

export function appRoute(app: express.Router) {
    app.route("/tabs/deletegroup").post(Route.deletegroup);
    app.route("/tabs/unsubscribefollowers").post(Route.unsubscribefollowers);
    app.route("/tabs/fillfollowers").post(Route.fillfollowers);
    app.route("/tabs/subscribefollowers").post(Route.subscribefollowers);

    app.route("/tabs/tabs").get(Route.tabs).post(Route.newtab).put(Route.newtab);
    app.route("/tabs/:tabid/history/:index").get(Route.history);

    app.route("/tabs/fillmytab").get(Route.fillmytab);
    app.route("/tabs/annotations").get(Route.annotations);

    app.route("/tabs/find").get(Route.find);



    app.route("/tabs/followedfeeds").get(Route.followedfeeds);
    app.route("/tabs/feeds").post(Route.feeds);
    app.route("/tabs/search").post(Route.search);

    app.route("/tabs/metadata").get(Route.metadata);






}
