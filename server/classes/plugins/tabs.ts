import { DataLogic } from "../datalogic";
var debug = require('debug')('juntas');

var ObjectID = require("mongodb").ObjectID;
var moment = require('moment');
var thumbler = require('../thumbler');
var verifier = require('../verifier').verifier;
var cache = require('@nodulus/cache');
var path = require('path');
var dal = require('@nodulus/data');
var logger = require('@nodulus/logs').logger;
var logic = new DataLogic();

var mkdirp = require('mkdirp');


class tabs_plugin {
    constructor(socket: any, io: any) {
        socket.on('tabs:navigate', (data: any) => {
            debug('tabs:navigate', data);
            var tabid = data.TabId;
            global.socketManager.ensureOnlineState(tabid, data.UserId);
            logger.debug('tabs:navigate', data);
            if (global.Rooms[tabid] !== undefined) {
                logger.debug("verify : ", data.Url);
                verifier.verify(data, (metadata: any) => {
                    logger.debug("metadata : ", metadata);
                    if (metadata !== null) {
                        var actionGuid = thumbler.url2filename(data.Url);
                        var filepathbase = moment().format("MM_YYYY") + '/' + actionGuid + ".jpg";
                        if (metadata["og:image"] !== undefined) {
                            filepathbase = metadata["og:image"];
                        }
                        else if (data.Url.indexOf('.png') > 0 || data.Url.indexOf('.jpg') > 0) {
                            filepathbase = data.Url;

                        }
                        else {
                            filepathbase = 'https://juntas.s3.amazonaws.com/' + filepathbase;
                            thumbler.capture(data, actionGuid, function () {
                                io.to(tabid).emit("image captured", {
                                    "TabId": tabid,
                                    "FileName": filepathbase
                                });
                            });
                        }
                        if (metadata["title"] !== undefined) {
                            data.Title = metadata["title"];
                        }

                        var _id = new ObjectID();
                        cache.get('Tabs', tabid, (tab: any) => {
                            var pushObject = {
                                "_id": _id,
                                "hash": actionGuid,
                                "Title": data.Title,
                                "Date": new Date(),
                                "UserId": data.UserId,
                                "Url": data.Url,
                                "Thumb": filepathbase,
                                "TabId": tabid,
                                "Configuration": {
                                    "Discovery": tab.Configuration.Discovery, "Rating": tab.Configuration.Rating
                                }



                            };

                            io.to(tabid).emit("tabs:navigate", {
                                "TabId": tabid,
                                "Map": pushObject
                            });

                            //io.to(tabid).emit("image captured", {
                            //    "TabId": tabid,
                            //    "FileName": filepathbase
                            //});



                            dal.connect((err: any, db: any) => {
                                if (err === null) {
                                    db.collection("History").findOne({
                                        "hash": pushObject.hash,
                                        "UserId": pushObject.UserId,
                                        "TabId": pushObject.TabId
                                    }, (err: any, data: any) => {
                                        if (data !== null) {
                                            pushObject.Date = new Date();
                                            dal.query("UPDATE History SET Date=@Date", { Date: new Date() }, function (data: any) {



                                                if (tab.Configuration.Discovery === "public") {
                                                    db.collection("Users").find({ _id: ObjectID(pushObject.UserId) }, { "FirstName": 1, "LastName": 1, "Picture": 1 }).toArray(function (err: any, userData: any) {
                                                        if (userData.length > 0) {
                                                            io.emit("tabs:navigate public", {
                                                                "TabId": tabid,
                                                                "Map": pushObject,
                                                                "Tab": tab,
                                                                "User": userData[0],
                                                                "Meta": metadata
                                                            });
                                                        }
                                                    });
                                                }

                                            });
                                        } else {
                                            pushObject.Configuration = tab.Configuration;
                                            dal.query("INSERT INTO History", pushObject, (data: any) => {
                                                if (tab.Configuration.Discovery === "public") {
                                                    db.collection("Users").find({ _id: ObjectID(pushObject.UserId) }, { "FirstName": 1, "LastName": 1, "Picture": 1 }).toArray(function (err: any, userData: any) {
                                                        if (userData.length > 0) {
                                                            io.emit("tabs:navigate public", {
                                                                "TabId": tabid,
                                                                "Map": pushObject,
                                                                "Tab": tab,
                                                                "User": userData[0],
                                                                "Meta": metadata
                                                            });
                                                        }

                                                    })


                                                }
                                            });
                                        }
                                    });
                                }
                            });

                        });



                    }
                });

            }
        });


        socket.on('tab annotate', (data: any) => {
            debug('tab annotate', data);
            var tabid = data.TabId;
            global.socketManager.ensureOnlineState(tabid, data.UserId);
            logger.debug('tab annotate', data);
            if (global.Rooms[tabid] !== undefined) {
                logger.debug("verify : ", data.Url);
                verifier.verify(data, (metadata: any) => {
                    logger.debug("metadata : ", metadata);
                    if (metadata !== null) {
                        var actionGuid = thumbler.url2filename(data.Url);
                        var elementGuid = thumbler.url2filename(data.Element);

                        var filepathbase = moment().format("MM_YYYY") + '/' + actionGuid + ".jpg";
                        if (metadata["og:image"] !== undefined) {
                            filepathbase = metadata["og:image"];
                        }
                        else if (data.Url.indexOf('.png') > 0 || data.Url.indexOf('.jpg') > 0) {
                            filepathbase = data.Url;

                        }
                        else {
                            filepathbase = 'https://juntas.s3.amazonaws.com/' + filepathbase;
                            thumbler.capture(data, actionGuid, function () {
                                io.to(tabid).emit("image captured", {
                                    "TabId": tabid,
                                    "FileName": filepathbase
                                });
                            });
                        }
                        //filepathbase = "noimage.png";
                        //   else {

                        //} 



                        if (metadata["title"] !== undefined) {
                            data.Title = metadata["title"];
                        }

                        var _id = new ObjectID();

                        var pushObject: any = {
                            "_id": _id,
                            "hash": actionGuid,
                            "elementGuid": elementGuid,
                            "Title": data.Title,
                            "Date": new Date(),
                            "UserId": data.UserId,
                            "Url": data.Url,
                            "Element": data.Element,
                            "TabId": tabid,
                            "Annotation": data.Annotation,
                            "Configuration": null
                        };

                        io.to(tabid).emit("tab annotate", {
                            "TabId": tabid,
                            "Map": pushObject
                        });

                        dal.connect((err: any, db: any) => {
                            if (err === null) {
                                db.collection("Annotation").findOne({
                                    "elementGuid": pushObject.elementGuid,
                                    "hash": pushObject.hash,
                                    "UserId": pushObject.UserId,
                                    "TabId": pushObject.TabId
                                }, (err: any, data: any) => {
                                    if (data !== null) {
                                        pushObject._id = data._id;
                                    }
                                    cache.get('Tabs', tabid, (tab: any) => {
                                        pushObject.Configuration = tab.Configuration;
                                        dal.query("INSERT INTO Annotation", pushObject, (data: any) => {
                                        });
                                    });

                                });
                            }
                        });
                    }
                });
            }
        });


        socket.on('tab disconnect', (tabid: string, userid: string) => {

            io.to(tabid).emit("tab disconnect", {
                "TabId": tabid,
                "User": { "_id": userid }
            });


        });

        socket.on('tabs:connect', (data: any, userid: string) => {


            var tabid = data._id.toString();


            global.socketManager.joinRoom(tabid, socket);



            logger.info("connecting to room:" + tabid);
            //  if (socket.rooms.indexOf(tabid) === -1)
            //      socket.join(tabid);
            //if (Rooms[tabid] === undefined) {
            dal.getSingle("Tabs", tabid, function (result: any) {
                if (result !== null) {
                    if (result.Followers === undefined)
                        result.Followers = [];

                    if (result.Followers.indexOf(userid) == -1) {
                        result.Followers.push(userid)
                        dal.pushObject(tabid, "Tabs", "Followers", userid, function (data: any) {
                            dal.getSingle("Users", userid, function (data: any) {
                                delete data.Password;
                                delete data.Token;
                                delete data.Email;


                                dal.getSingle("Tabs", tabid, function (result: any) {



                                    io.to(tabid).emit("user connected to tab", {
                                        "Tab": result,
                                        "TabId": tabid,
                                        "User": data
                                    });
                                });
                            })

                        })
                    }
                    else {
                        dal.getSingle("Users", userid, function (data: any) {
                            if (data.error === undefined) {
                                delete data.Password;
                                delete data.Token;
                                delete data.Email;

                                dal.getSingle("Tabs", tabid, function (result: any) {

                                    io.to(tabid).emit("user connected to tab", {
                                        "Tab": result,
                                        "TabId": tabid,
                                        "User": data
                                    });
                                });
                            }
                        })
                    }




                    if (global.Rooms[tabid] === undefined) {
                        global.Rooms[tabid] = result;
                        global.Rooms[tabid].online = {};
                        global.Rooms[tabid].online[socket.userid] = true;
                    }
                    else {
                        if (!global.Rooms[tabid].online)
                            global.Rooms[tabid].online = {};

                        global.Rooms[tabid].online[socket.userid] = true;

                    }


                }
            })
        });

        socket.on('tab create', (data: any) => {

            if (global.Rooms[data._id] === undefined)
                global.Rooms[data._id] = data;

            global.socketManager.joinRoom(data._id, socket)

            //  if (socket.rooms.indexOf(data._id) === -1)
            //      socket.join(data._id);



            dal.getSingle("Users", data.UserId, (user: any) => {
                delete user.Password;
                delete user.Token;
                delete user.Email;

                io.to(data._id).emit("user connected to tab", {
                    "TabId": data._id,
                    "User": user
                });
            })


            logger.info("created room: " + data);
        });

        socket.on('tab contact', (data: any) => {
            global.socketManager.ensureOnlineState(data.UserId);

            var contactId = data.ToUserId;
            if (global.socketManager.isUserOnline(contactId)) {



            }


        });

        socket.on('save tab configuration', (tabdata: any) => {
            var jsonVersion = "{}";
            var obj = tabdata;

            if (obj._id) {
                var query = "UPDATE Tabs SET Image=@Image, Description=@Description, Configuration=@Configuration WHERE _id=@_id";
                if (obj.Image && obj.Image.base64) {
                    var actionGuid = obj._id;
                    var dateKey = moment().format("MM_YYYY");
                    var filepathbase = dateKey + '/' + actionGuid + ".jpg";
                    // filepathbase = 'https://juntas.s3.amazonaws.com/' + filepathbase;

                    var imagetTempPath = path.join('temp', dateKey, actionGuid + "_tmp.jpg");

                    var base64Data = obj.Image.base64;
                    mkdirp(path.join('temp', dateKey), function (err: any) {
                        if (err) console.error(err);

                        require("fs").writeFile(imagetTempPath, base64Data, 'base64', function (err: any) {
                            thumbler.upload_s3(imagetTempPath, dateKey, actionGuid + '.jpg', "image/jpg", null).then(function () {
                                console.log('all is well');

                            }).catch(function (error: any) {
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
                    socket.emit('save tab configuration', tab[0]);
                });
                return;
            }
        });

        socket.on('notify party', (data: any) => {
            logger.debug('notify party', data);
            var tabid = data.TabId;
            var userid = data.UserId;

            global.socketManager.ensureOnlineState(userid);


            dal.getSingle("Tabs", tabid, (result: any) => {
                if (result !== null) {
                    if (result.Followers === undefined)
                        result.Followers = [];

                    if (result.Followers.indexOf(userid) == -1) {
                        result.Followers.push(userid)
                        dal.pushObject(tabid, "Tabs", "Followers", userid, (data: any) => {
                            dal.getSingle("Users", userid, function (data: any) {
                                delete data.Password;
                                delete data.Token;
                                delete data.Email;


                                dal.getSingle("Tabs", tabid, (result: any) => {

                                    logger.debug('emit user connected to tab', result);
                                    result._id = result._id.toString();

                                    io.to(tabid).emit("notify party", {
                                        "Tab": result,
                                        "TabId": tabid,
                                        "User": data
                                    });
                                });
                            })

                        })
                    }
                    else {
                        dal.getSingle("Users", userid, (data: any) => {
                            if (data.error === undefined) {
                                delete data.Password;
                                delete data.Token;
                                delete data.Email;

                                dal.getSingle("Tabs", tabid, (result: any) => {

                                    io.to(tabid).emit("notify party", {
                                        "Tab": result,
                                        "TabId": tabid,
                                        "User": data
                                    });
                                });
                            }
                        })
                    }




                    if (global.Rooms[tabid] === undefined) {
                        global.Rooms[tabid] = result;
                        global.Rooms[tabid].online = {};
                        global.Rooms[tabid].online[socket.userid] = true;
                    }
                    else {
                        if (!global.Rooms[tabid].online)
                            global.Rooms[tabid].online = {};

                        global.Rooms[tabid].online[socket.userid] = true;

                    }


                }
            })






        });

        socket.on('load public annotations', (data: any, callback: Function) => {
            debug('load public annotations', data);
            dal.connect(function (err: any, db: any) {
                var actionGuid = thumbler.url2filename(data.Url);
                db.collection("Annotation").find({
                    "hash": actionGuid
                }).toArray(function (err: any, annotations: any) {
                    if (annotations) {
                        var userIds = annotations.map((o: any) => { return o.UserId });
                        cache.get('Users', userIds, function (users: any) {
                            var usersObj: any = {};

                            users.map(function (o: any) { usersObj[o._id] = { FirstName: o.FirstName, LastName: o.LastName, Picture: o.Picture, _id: o._id }; });
                            callback({ annotations: annotations, users: usersObj });
                        });
                    } else {
                        callback({});
                    }
                });
            });
        });

        socket.on('get page data', (data: any, callback: Function) => {
            debug('get page data', data);
            dal.connect(function (err: any, db: any) {
                var actionGuid = thumbler.url2filename(data.Url);


                //db.collection("Annotation").find({
                //    $query: {
                //        "TabId": req.query._id,
                //        "hash": actionGuid
                //    }
                //}).limit(20).toArray(function (err: any, data: any) {

                //    finalObject.annotations = data;
                //    var userids = [];
                //    data.forEach(function (item) {
                //        // if (!finalObject.users[item.UserId]) {
                //        userids.push(item.UserId);
                //        // }
                //    });
                //    cache.get('Users', userids, (userdata: any) => {


                //        finalObject.users = userdata;
                //        res.json(finalObject);

                //    }, true);
                //});




                db.collection('History').find({
                    'Url': data.Url, 'Configuration.Discovery': 'public'
                }, { 'TabId': 1 }).toArray(function (err: any, history: any) {
                    if (history.length > 0) {
                        db.collection("Annotation").find({

                            "hash": actionGuid

                        }).count(function (err: any, annotationsCount: any) {
                            debug('annotation count', annotationsCount, err);

                            var tabsIdArr = history.map(function (item: any) { return ObjectID(item.TabId); });


                            cache.get('Tabs', tabsIdArr, function (tabs: any) {
                                var usersIdArr = tabs.map(function (item: any) { return item.UserId; });
                                cache.get('Users', usersIdArr, function (users: any) {

                                    tabs = tabs.map((o: any) => { return { 'Name': o.Name, 'Description': o.Description, 'Image': o.Image,'UserId': o.UserId,  'User': {'Name': users[o.UserId].FirstName + ' ' + users[o.UserId].LastName} } });
                                    // tabs = tabs.map((o: any) => { return { 'Name': o.Name, 'Description': o.Description, 'Image': o.Image } });
                                    callback({ history: history, tabs: tabs, annotations: annotationsCount });

                                }, true);

                            });
                            // db.collection('Tabs').find({ _id: { "$in": tabsIdArr } }, { 'Name': 1, 'Description': 1 }).toArray(function (err, tabs) {
                            //     callback({ history: history, tabs: tabs, annotations: annotationsCount});

                            // });


                        });


                    } else {
                        callback({});
                    }
                });
            });

        });

    }


}
export default tabs_plugin;