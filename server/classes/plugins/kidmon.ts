import { DataLogic } from "../datalogic";

var ObjectID = require("mongodb").ObjectID;
var moment = require('moment');
var thumbler = require('../thumbler');
var verifier = require('../verifier').verifier;
var cache = require('@nodulus/cache');
var path = require('path');
var dal = require('@nodulus/data');
var logger = require('@nodulus/logs').logger;
var logic = new DataLogic();

function maybe(object: any) {
    if (!object)
        return {}
    return object;
}
class kidmon_plugin {
    constructor(socket: any, io: any) {
        socket.on('kidmon:navigate', (data: any) => {
            var tabid = data.TabId;
            global.socketManager.ensureOnlineState(tabid, data.UserId);
            logger.debug('kidmon:navigate', data);
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
                                    "Discovery": maybe(tab.Configuration).Discovery, "Rating": maybe(tab.Configuration).Rating
                                }



                            };

                            io.to(tabid).emit("kidmon:navigate", {
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
                                                            io.emit("kidmon:navigate public", {
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
                                                            io.emit("kidmon:navigate public", {
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


        socket.on('set barcode', (data: any) => {
            var guid = data.guid;


            if (global.Rooms[guid] !== undefined) {


            }
        });

        socket.on('kidmon add page', (data: any) => {
            var guid = data.guid;
            var url = data.url;
            var title = data.title;
            var actionGuid = thumbler.url2filename(url);
            dal.connect((err: any, db: any) => {
                if (err === null) {
                    var pushObject = { 'KIDID': guid, 'url': url, 'title': title, date: new Date() };
                    dal.query("INSERT INTO KIDMON_History", pushObject, (data: any) => {



                    });
                }
            });
        });


    }
}
export default kidmon_plugin;