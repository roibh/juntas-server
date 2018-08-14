import moment = require('moment');
var dal = require('@nodulus/data');
var fs = require('fs');
var util = require('util');
var path = require('path');


export class verifier {
    constructor() {





    }
    public static verify(data: any, callback: Function) {

        var tabid = data.TabId;

        var dateKey = moment().format("MM_YYYY");



        var request = require('request')
        var url = data.Url;

        var urlkey = this.url2filename(url);

        dal.connect(function (err: any, db: any) {

            db.collection("Metadata").findOne({ "hash": urlkey }, function (err: any, metadata: any) {

                if (metadata === null) {







                    // use a timeout value of 10 seconds
                    var timeoutInMilliseconds = 10 * 1000
                    var opts = {
                        encoding: 'utf-8',
                        url: url,
                        timeout: timeoutInMilliseconds
                    }



                    if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {

                        request(opts, function (err: any, res: any, body: any) {
                            if (err) {
                                console.dir(err)
                                return
                            }
                            var statusCode = res.statusCode
                            var cheerio = require('cheerio'),
                                $ = cheerio.load(body);

                            var t = $('meta');
                            var ttag = $('title');
                            var saveObject: any = { "hash": urlkey };

                            for (var i = 0; i < t.length; i++) {
                                if (t[i].attribs.property !== undefined) {
                                    saveObject[t[i].attribs.property] = t[i].attribs.content;
                                }
                                else {
                                    saveObject[t[i].attribs.name] = t[i].attribs.content;
                                }

                            }

                            if (ttag.length > 0 && ttag[0].children.length > 0)
                                saveObject["title"] = ttag[0].children[0].data;// ttag.children[0].data;

                            db.collection("Metadata").save(saveObject, function (err: any, result: any) {

                                callback(saveObject);

                            })


                        })
                    }
                    else {
                        callback(null);
                    }
                }
                else {
                    callback(metadata);
                }

            })
        });

























    }

    public static url2filename(str: string) {

        return this.hashCode(str);//.split("?")[0].replace(/\//g, '').replace(/:/g, '').replace(/\./g, '');
    }

    public static hashCode(str: string) {
        var hash: any = 0;
        var char: number;
        if (str.length == 0) return hash;
        for (var i: number = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }



}


