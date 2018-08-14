var ObjectID = require("mongodb").ObjectID;
var moment = require('moment');
var thumbler = require('../thumbler.js');
var verifier = require('../verifier.js');

var path = require('path');
var dal = require('@nodulus/data');
var cache = require('@nodulus/cache');



class webrtc_plugin {

    constructor(socket: any, io: any) {
        /*web rtc events*/

        socket.on('webrtc send offer', function (tabid:string, userid:string, offer: any, application: any) {

            cache.get('Users', userid, (user: any) => {
                delete user.Password;
                delete user.Email;
                socket.broadcast.to(tabid).emit("webrtc create offer", {
                    "TabId": tabid,
                    "User": user,
                    "offer": offer,
                    "application":application
                });
            });
        });

        socket.on('webrtc send answer', function (tabid:string, userid:string, offer: any,application: any) {

            cache.get('Users', userid, (user: any) => {
                delete user.Password;
                delete user.Email;

                socket.broadcast.to(tabid).emit("webrtc offer accepted", {
                    "TabId": tabid,
                    "User": user,
                    "offer": offer,
                    "application":application
                });

            });

        });

        socket.on('webrtc ice candidate', function (tabid:string, userid:string, ice: any,application: any) {

            socket.broadcast.to(tabid).emit("webrtc ice candidate", {
                "TabId": tabid,
                "UserId": userid,
                "ice": ice,
                "application":application
            });

        });
    }


}

export default webrtc_plugin;