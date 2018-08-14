import { DataLogic } from "../datalogic";

var ObjectID = require("mongodb").ObjectID;
var moment = require('moment');
var thumbler = require('../thumbler.js');
var verifier = require('../verifier.js');
 
var path = require('path');
var dal = require('@nodulus/data');
 
var logic = new DataLogic();

  class user_plugin {

    constructor(socket:any, io:any) {


        socket.on('user is typing', function (tabid:string, userid:string) {

            io.to(tabid).emit("user is typing", {
                "TabId": tabid,
                "UserId": userid
            });

        });

        socket.on('post message', function (tabid:string, userid:string, message:string, itemid:string) {
            var pushObject = {
                "Date": new Date(),
                "Message": message,
                "UserId": userid,
                "TabId": tabid,
                "ItemId": itemid
            };
            var sql = "INSERT INTO Comments";
            dal.query(sql, pushObject, function (data:any) {
                io.to(tabid).emit("commentAdded", {
                    "tabid": tabid,
                    "comment": pushObject
                });
            });



            //tabid, "Tabs", "Comments" , pushObject, function (data) {
            //    io.to(tabid).emit("commentAdded", { "tabid": tabid , "comment": pushObject });
            //});
        });

        socket.on('pop member', function (tabid:string, url:string, userid:string) {
            var pushObject = {
                "Date": new Date(),
                "Url": url,
                "UserId": userid
            };
            io.to(tabid).emit("pop member", {
                "TabId": tabid,
                "Map": pushObject
            });
        });

        socket.on('delete history', function (tabid:string, userid:string, id:string) {
            dal.connect(function (err:any, db:any) {
                if (err === null) {
                    db.collection("History").remove({
                        "_id": ObjectID(id)
                    }, function () {
                        io.to(tabid).emit("delete history", {
                            "TabId": tabid,
                            "_id": id
                        });
                    })
                }
            })




        });


        socket.on('get user state', function (data:any) {
            //global.logger.debug('get user state', data);
            var result = [];
            for (var i = 0; i < data.users.length; i++) {
                if (global.socketManager.isUserOnline(data.users[i])) {
                    result.push(data.users[i]);
                }

            }

            if (global.socketManager.sockets[data.UserId]) {
               // global.logger.debug('get user state result', result);
                global.socketManager.sockets[data.UserId].emit("user state", {
                    "Users": result

                });
            }





        });


        socket.on('like url', function (tabid:string, userid:string, hash:string, rate:string, ratetext:string) {
            var pushObject = {
                "TabId": tabid,
                "UserId": userid
            };
            dal.connect(function (err:any, db:any) {
                if (err === null) {

                    var pusher:any = {};
                    pusher["Likes"] = pushObject;
                    db.collection("Metadata").update({
                        'hash': hash
                    }, {
                            $addToSet: pusher
                        }, function (err:any, data:any) {
                            if (err === null) {
                                io.to(tabid).emit("like url", {
                                    "TabId": tabid,
                                    "Map": pushObject,
                                    "hash": hash
                                });
                            }
                        });
                }



            });





        });

        socket.on('page scroll', function (tabid:string, userid:string, details:any) {

            io.to(tabid).emit("page scroll", {
                "TabId": tabid,
                "UserId": userid,
                "details": details
            });

        });


    }

}

export default user_plugin;