﻿
import * as express from "express";

var util = require('util');
var fs = require('fs');
var path = require('path');
var dal = require("@nodulus/data");
var ObjectID = require("mongodb").ObjectID;
var moment = require('moment');

class Route {



    public static feed(req: express.Request, res: express.Response) {
        var UserId = req.body.UserId;
        dal.connect(function (err: any, db: any) {
            db.collection("Tabs").find({ "UserId": UserId }).toArray(function (err: any, arr: any) {
                res.status(200).json({ items: arr });
            })
        })

    }

    public static oauth(req: express.Request, res: express.Response) {
        if (!req.body) return res.sendStatus(400);
        var query = "SELECT * FROM Users WHERE Uid=@Uid;";
        dal.query(query, { "Uid": req.body.Uid },  (user: any) => {
            if (user.length == 0) {
                user = {
                    "FirstName": req.body.FirstName,
                    "LastName": req.body.LastName,
                    "Picture": req.body.Picture,
                    "Email": req.body.Email,
                    "Token": req.body.Token,
                    "Uid": req.body.Uid
                }
                var query = "INSERT INTO Users";
                dal.query(query, user, function (user: any) {

                    query = "SELECT * FROM Users WHERE Uid=@Uid;";
                    dal.query(query, { "Uid": req.body.Uid },  (user: any) => {
                        this.mapRooms(user);
                        res.json(user);
                    });
                });
            } else {
                var query = "UPDATE Users SET FirstName=@FirstName,LastName=@LastName,Picture=@Picture,Email=@Email,Token=@Token,Uid=@Uid WHERE Uid=@Uid;";
                dal.query(query, {
                    "FirstName": req.body.FirstName,
                    "LastName": req.body.LastName,
                    "Picture": req.body.Picture,
                    "Email": req.body.Email,
                    "Token": req.body.Token,
                    "Uid": req.body.Uid
                }, function (result: any) {
                    res.json(result[0]);
                });
            }
        });
    }
    public static facebook(req: express.Request, res: express.Response) {
        if (!req.body) return res.sendStatus(400);
        var query = "SELECT * FROM Users WHERE Uid=@Uid;";
        dal.query(query, { "Uid": req.body.Uid }, function (users: any) {
            if (users.length == 0) {
                user = {
                    "FirstName": req.body.FirstName,
                    "LastName": req.body.LastName,
                    "Picture": req.body.Picture,
                    "Email": req.body.Email,
                    "Token": req.body.Token,
                    "Uid": req.body.Uid
                }
                var query = "INSERT INTO Users";
                dal.query(query, user, function (user: any) {
                    query = "SELECT * FROM Users WHERE _id=_id;";
                    dal.query(query, { "_id": user.result.upserted[0]._id.toString() }, function (user: any) {
                        res.json(user[0]);
                    });
                });
            } else {
                var user = users[0];
                var query = "UPDATE Users SET FirstName=@FirstName,LastName=@LastName,Picture=@Picture,Email=@Email,Token=@Token,Uid=@Uid WHERE _id=@_id;";
                dal.query(query, {
                    "_id": user._id,
                    "FirstName": req.body.FirstName,
                    "LastName": req.body.LastName,
                    "Picture": req.body.Picture,
                    "Email": req.body.Email,
                    "Token": req.body.Token,
                    "Uid": req.body.Uid
                }, function (result: any) {
                    res.json(result[0]);
                });
            }
        });
    } 
    public static login(req: express.Request, res: express.Response) {
        if (!req.body) return res.sendStatus(400);
        //var api_token = req.headers["api_key"];
        //var device_id = req.headers["device_id"];
        //if (api_token !== global.api_token) {
        //    res.status(403).json({ "error": { message: "api_token is invalid" } });
        //    return;
        //}
        //if (device_id === null || device_id === undefined) {
        //    res.status(403).json({ "error": { message: "device_id is missing" } });
        //    return;
        //}
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        var email = req.body.Email;
        var password = req.body.Password;
        var query = "SELECT * FROM Users WHERE Email=@Email AND Password=@Password;";
        dal.query(query, { "Email": email, "Password": password }, function (user: any) {
            if (user.length == 0) {
                user = { error: { message: "user not found" } };
                res.json(user);
                return;
            }
            else {
                ////check deviceid
                //if (user[0].Devices !== undefined && user[0].Devices.indexOf(device_id) == -1 && user[0].Devices.length > 0) {
                //    user = { error: { message: "invalid device" } };
                //    res.status(400).json(user);
                //    return;
                //}
                //else {
                //    user[0].Devices = [];
                //    user[0].Devices.push(device_id);
                //}
                var tokenDate = moment().utc().format("YYYY-MM-DDTHH:mm.ssZ");
                query = "UPDATE Users SET Token=@Token,TokenDate=@TokenDate WHERE _id=@_id";
                require('crypto').randomBytes(48, function (ex: any, buf: any) {
                    var token = buf.toString('hex');
                    dal.query(query, { "TokenDate": tokenDate, "Token": token, "_id": user[0]._id }, function (user: any) {
                        res.json(user[0]);
                        return;
                    })
                });
            }
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
    public static logout(req: express.Request, res: express.Response) {
        if (!req.body) return res.sendStatus(400);
        //if (api_token !== global.api_token) {
        //    res.status(403).json({ "error": { message: "api_token is invalid" } });
        //    return;
        //}
        var token = req.body.Token
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        var query = "SELECT * FROM Users WHERE Token=@Token";
        dal.query(query, { "Token": token }, function (user: any) {
            if (user.length == 0) {
                user = { error: { message: "not found" } };
                res.json(user);
            }
            else {
                query = "UPDATE Users SET Token=@Token WHERE _id=@_id";
                dal.query(query, { "Token": null, "_id": user[0]._id }, function (user: any) {
                    res.json({ "result": "ok" });
                });
            }
        });
    }
    public static register(req: express.Request, res: express.Response) {
        if (!req.body) return res.sendStatus(400);
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        var email = req.body.Email;
        var password = req.body.Password;
        var user = req.body;
        var query = "SELECT * FROM Users WHERE Email=@Email;";
        dal.query(query, { "Email": user.Email }, function (exuser: any) {
            if (exuser.length == 0) {
                var query = "INSERT INTO Users FirstName=@FirstName, LastName=@LastName,  Email=@Email,Password=@Password;";
                dal.query(query, { "Email": user.Email, "Password": user.Password, "FirstName": user.FirstName, "LastName": user.LastName }, function (user: any) {
                    if (user.result.upserted && user.result.upserted[0]) {
                        query = "SELECT * FROM Users WHERE _id=@_id;"
                        dal.query(query, { _id: user.result.upserted[0]._id.toString() }, function (user: any) {
                            try {
                                res.json(user[0]);
                            } catch (error) {
                                res.json({ error: { message: error } });
                            }
                        });
                    }
                });
            }
            else {
                user = { error: { message: "user exists" } };
                res.json(user);
            }
        });

    }


    public static getContacts(req: express.Request, res: express.Response) {
        var UserId = req.query.UserId;
        var query = "SELECT * FROM Contacts WHERE UserId=@UserId;";
        dal.query(query, { "UserId": UserId }, function (userContacts: any) {
            var ma
            var users_for_contacts = userContacts.map(function (a: any) {
                if (typeof (a.ContactId) == "string")
                    return ObjectID(a.ContactId);
                else
                    return a.ContactId;
            })
            var finalObject: any = {}
            dal.getSet(users_for_contacts, "Users", function (data: any) {
                for (var i = 0; i < data.length; i++) {
                    delete data[i].Password;
                    delete data[i].Email;
                    finalObject[data[i]._id] = data[i];
                }
                for (var i = 0; i < userContacts.length; i++) {
                    userContacts[i].User = finalObject[userContacts[i].ContactId];
                }

                res.json(userContacts);
            });




        })

    }
    public static addContact(req: express.Request, res: express.Response) {
        var contact = req.body;
        var query = "INSERT INTO Contacts";
        dal.query(query, contact, function (contact: any) {
            res.json(contact);
        })


    }
    public static removeContact(req: express.Request, res: express.Response) {

        dal.deleteCollection("Contacts", req.body._id, function (data: any) {
            res.json({
                "result": "ok"
            });
            //if (data.UserId !== req.body.userId) {
            //    data.Followers.splice(data.Followers.indexOf(req.body.userId), 1);
            //    var query = "INSERT INTO Tabs";
            //    dal.query(query, data, function (tab) {
            //        res.json(data);
            //    });
            //}
        })
    }






    public static mapRooms(user: any) {
        var query = "SELECT * FROM Tabs WHERE Followers in @Followers";
        dal.query(query, { "Followers": [user._id] }, function (items: any) {
            for (var i = 0; i < items.length; i++) {
                if (global.Rooms[items[i]._id] === undefined) {
                    global.Rooms[items[i]._id] = items[i]
                }
            }
        });
    }
}


export function appRoute(app: express.Router) {

    app.route("/user/feed").post(Route.feed);
    app.route("/user/oauth").post(Route.oauth);
    app.route("/user/facebook").post(Route.facebook);

    app.route("/user/login").post(Route.login);
    app.route("/user/logout").post(Route.logout);
    app.route("/user/register").post(Route.register);

    app.route("/user/contacts").get(Route.getContacts);
    app.route("/user/contacts").post(Route.addContact);
    app.route("/user/contacts").delete(Route.removeContact);


}

