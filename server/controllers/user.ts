
import { Method, MethodConfig, MethodError, MethodResult, Verbs, Body, Query, Param } from '@methodus/server';



var util = require('util');
var fs = require('fs');
var path = require('path');
var dal = require("@nodulus/data");
var ObjectID = require("mongodb").ObjectID;
var moment = require('moment');
 


// app.route("/user/feed").post(Route.feed);
// app.route("/user/oauth").post(Route.oauth);
// app.route("/user/facebook").post(Route.facebook);

// app.route("/user/login").post(Route.login);
// app.route("/user/logout").post(Route.logout);
// app.route("/user/register").post(Route.register);

// app.route("/user/contacts").get(Route.getContacts);
// app.route("/user/contacts").post(Route.addContact);
// app.route("/user/contacts").delete(Route.removeContact);


@MethodConfig('User')
export class User {
    @Method(Verbs.Post, '/user/feed')
    public static async feed(@Body('aaaa') body) {
        var UserId = body.UserId;
        const db = await dal.connect();
        const arr = await db.collection("Tabs").find({ "UserId": UserId }).toArray();
        return new MethodResult({ items: arr });

    }
    @Method(Verbs.Get, '/user/:userid')
    public static async oauth(@Param('userid') UserId) {

        const db = await dal.connect();
        const arr = await db.collection("Tabs").find({ "UserId": UserId }).toArray();
        return new MethodResult({ items: arr });

    }


    @Method(Verbs.Post, '/user/oauth')
    public static async oauth_post(@Body() body: any) {
        if (!body)
            throw new MethodError('bad request', 400);

        var query = "SELECT * FROM Users WHERE Uid=@Uid;";
        const users = await dal.query(query, { "Uid": body.Uid });

        if (users.length == 0) {
            var user = {
                "FirstName": body.FirstName,
                "LastName": body.LastName,
                "Picture": body.Picture,
                "Email": body.Email,
                "Token": body.Token,
                "Uid": body.Uid
            }
            var query = "INSERT INTO Users";
            user = await dal.query(query, user);

            query = "SELECT * FROM Users WHERE Uid=@Uid;";
            user = await dal.query(query, { "Uid": body.Uid });
            this.mapRooms(user);
            return new MethodResult(user);


        } else {
            var query = "UPDATE Users SET FirstName=@FirstName,LastName=@LastName,Picture=@Picture,Email=@Email,Token=@Token,Uid=@Uid WHERE Uid=@Uid;";
            const result = await dal.query(query, {
                "FirstName": body.FirstName,
                "LastName": body.LastName,
                "Picture": body.Picture,
                "Email": body.Email,
                "Token": body.Token,
                "Uid": body.Uid
            });
            return new MethodResult(result[0]);
        }

    }

    @Method(Verbs.Post, '/user/facebook')
    public static async facebook(@Body() body: any) {

        var query = "SELECT * FROM Users WHERE Uid=@Uid;";
        let users = await dal.query(query, { "Uid": body.Uid });
        if (users.length == 0) {
            let user;
            user = {
                "FirstName": body.FirstName,
                "LastName": body.LastName,
                "Picture": body.Picture,
                "Email": body.Email,
                "Token": body.Token,
                "Uid": body.Uid
            }
            var query = "INSERT INTO Users";
            const userResult = await dal.query(query, user);
            // query = "SELECT * FROM Users WHERE _id=_id;";
            // users = await dal.query(query, { "_id": user.result.upserted[0]._id.toString() });
            return new MethodResult(userResult);
        } else {
            var user = users[0];
            var query = "UPDATE Users SET FirstName=@FirstName,LastName=@LastName,Picture=@Picture,Email=@Email,Token=@Token,Uid=@Uid WHERE _id=@_id;";
            const result = await dal.query(query, {
                "_id": user._id,
                "FirstName": body.FirstName,
                "LastName": body.LastName,
                "Picture": body.Picture,
                "Email": body.Email,
                "Token": body.Token,
                "Uid": body.Uid
            });
            return result[0];
        }

    }


    @Method(Verbs.Post, '/user/login')
    public static async login(@Body() body) {

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
        var email = body.Email;
        var password = body.Password;
        var query = "SELECT * FROM Users WHERE Email=@Email AND Password=@Password;";
        const user = await dal.query(query, { "Email": email, "Password": password });
        if (user.length == 0) {
            throw (new MethodError({ error: { message: "user not found" } }))

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
            const result = new Promise(async (resolve, reject) => {
                require('crypto').randomBytes(48, async (ex: any, buf: any) => {
                    var token = buf.toString('hex');
                    const tokenedUser = await dal.query(query, { "TokenDate": tokenDate, "Token": token, "_id": user[0]._id });
                    resolve(tokenedUser[0]);
                });
            });
            return result;
        }

        // user.login(email, password,   function (user) { 
        // 
        //        if (user.error !== undefined ) return res.sendStatus(404);
        //        
        //       return res.json(user);
        //     
        //      
        //     });
    }


    @Method(Verbs.Post, '/user/logout')
    public static async logout(@Body() body) {

        //if (api_token !== global.api_token) {
        //    res.status(403).json({ "error": { message: "api_token is invalid" } });
        //    return;
        //}
        var token = body.Token
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        var query = "SELECT * FROM Users WHERE Token=@Token";
        const user = await dal.query(query, { "Token": token });
        if (user.length == 0) {
            throw (new MethodError({ message: "not found" }));

        }
        else {
            query = "UPDATE Users SET Token=@Token WHERE _id=@_id";
            const users = await dal.query(query, { "Token": null, "_id": user[0]._id });
            return new MethodResult({ "result": "ok" });
        }
    }

    @Method(Verbs.Post, '/user/register')
    public static async register(@Body() body) {

        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        var email = body.Email;
        var password = body.Password;
        var user = body;
        var query = "SELECT * FROM Users WHERE Email=@Email;";
        const exuser = await dal.query(query, { "Email": user.Email });
        if (exuser.length == 0) {
            var query = "INSERT INTO Users FirstName=@FirstName, LastName=@LastName,  Email=@Email,Password=@Password;";
            const dbuser = await dal.query(query, { "Email": user.Email, "Password": user.Password, "FirstName": user.FirstName, "LastName": user.LastName });
            if (dbuser.result.upserted && dbuser.result.upserted[0]) {
                query = "SELECT * FROM Users WHERE _id=@_id;"
                const tokenedUser = await dal.query(query, { _id: dbuser.result.upserted[0]._id.toString() });
                return new MethodResult(tokenedUser[0]);
            }
        }
        else {
            return new MethodResult({ error: { message: "user exists" } });
        }
    }


    //     public static getContacts(req: express.Request, res: express.Response) {
    //     var UserId = req.query.UserId;
    //     var query = "SELECT * FROM Contacts WHERE UserId=@UserId;";
    //     dal.query(query, { "UserId": UserId }, function (userContacts: any) {
    //         var ma
    //         var users_for_contacts = userContacts.map(function (a: any) {
    //             if (typeof (a.ContactId) == "string")
    //                 return ObjectID(a.ContactId);
    //             else
    //                 return a.ContactId;
    //         })
    //         var finalObject: any = {}
    //         dal.getSet(users_for_contacts, "Users", function (data: any) {
    //             for (var i = 0; i < data.length; i++) {
    //                 delete data[i].Password;
    //                 delete data[i].Email;
    //                 finalObject[data[i]._id] = data[i];
    //             }
    //             for (var i = 0; i < userContacts.length; i++) {
    //                 userContacts[i].User = finalObject[userContacts[i].ContactId];
    //             }

    //             res.json(userContacts);
    //         });




    //     })

    // }
    //     public static addContact(req: express.Request, res: express.Response) {
    //     var contact = req.body;
    //     var query = "INSERT INTO Contacts";
    //     dal.query(query, contact, function (contact: any) {
    //         res.json(contact);
    //     })


    // }
    //     public static removeContact(req: express.Request, res: express.Response) {

    //     dal.deleteCollection("Contacts", req.body._id, function (data: any) {
    //         res.json({
    //             "result": "ok"
    //         });
    //         //if (data.UserId !== req.body.userId) {
    //         //    data.Followers.splice(data.Followers.indexOf(req.body.userId), 1);
    //         //    var query = "INSERT INTO Tabs";
    //         //    dal.query(query, data, function (tab) {
    //         //        res.json(data);
    //         //    });
    //         //}
    //     })
    // }






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


// export function appRoute(app: express.Router) {

//     app.route("/user/feed").post(Route.feed);
//     app.route("/user/oauth").post(Route.oauth);
//     app.route("/user/facebook").post(Route.facebook);

//     app.route("/user/login").post(Route.login);
//     app.route("/user/logout").post(Route.logout);
//     app.route("/user/register").post(Route.register);

//     app.route("/user/contacts").get(Route.getContacts);
//     app.route("/user/contacts").post(Route.addContact);
//     app.route("/user/contacts").delete(Route.removeContact);


// }

