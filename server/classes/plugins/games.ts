import { DataLogic } from "../datalogic";

var ObjectID = require("mongodb").ObjectID;
var moment = require('moment');
var thumbler = require('../thumbler');
var verifier = require('../verifier').verifier;
var cache = require('@nodulus/cache');
var path = require('path');
var dal = require('@nodulus/data');

var logic = new DataLogic();


class tabs_plugin {
    constructor(socket:any, io:any) {
        socket.on('game start', (data:any) => {

            var tabid = data.tabid;
            var game_id = data.game_id;
            var user_id = data.user_id;


            //log and send invites
            dal.connect(function (err:any, db:any) {
                var sql = "SELECT * FROM Games WHERE TabId=@TabId AND GameId=@GameId";
                dal.query(sql, { TabId: tabid, GameId: game_id }, function (result:any) {
                    
                    if (result.length === 0) {

                        sql = "INSERT INTO Games TabId=@TabId AND GameId=@GameId";
                        dal.query(sql, { TabId: tabid, GameId: game_id }, function (output:any) {
                            var t = output.result.upserted[0];

                            io.to(tabid).emit("game data", {
                                "TabId": tabid,
                                "Game": t
                            });

                        });
                    }
                    else {
                        io.to(tabid).emit("game data", {
                            "TabId": tabid,
                            "Game": result[0]
                        });

                    }
                });
            });
        });



    }



}
export default tabs_plugin;