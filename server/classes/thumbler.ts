import moment = require('moment');
const fs = require('fs');
const util = require('util');
const path = require('path');
const dal = require('@nodulus/data');
const webshot = require('webshot');
const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
const http = require('http');
const Readable = require('stream').Readable;
const Writable = require('stream').Writable;
const Q = require('q');
const s3 = new aws.S3();
const bl = require('bl');

export class thumbler {
    constructor() {
    }

    public static capture(data: any, actionGuid: string, finishcallback?: Function) {

        if (!data) {
            if (finishcallback)
                finishcallback(null);
            return;
        }

        var tabid = data.TabId;
        var dateKey = moment().format("MM_YYYY");
        var persist_filename = dateKey + '/' + actionGuid + ".jpg";
        var s3Params = {
            Bucket: S3_BUCKET,
            Key: persist_filename,
            Expires: 60,
            ContentType: 'image/jpg',
            ACL: 'public-read'
        };
        s3.getSignedUrl('putObject', s3Params, (err: any, data: any) => {
            const returnData = {
                signedRequest: data,
                url: `https://${S3_BUCKET}.s3.amazonaws.com/${persist_filename}`
            };
            if (finishcallback)
                finishcallback(returnData);
        });



        var options = {
            streamType: 'jpg',
            renderDelay: 3000,
            screenSize: {
                width: 1024,
                height: 768
            }
            , shotSize: {
                width: 'window',
                height: 'window'
            }, zoomFactor: 1,
            userAgent: 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36'
        }

        var imagetTempPath = path.join('temp', dateKey, actionGuid + "_tmp.jpg");
        webshot(data.Url, imagetTempPath, options, (err: any, data: any) => {
            if (err !== null)
                return;
            thumbler.upload_s3(imagetTempPath, dateKey, actionGuid + '.jpg', "image/jpg", data).then(function () {
                console.log('all is well');
            }).catch(function (error: any) {
            });
        });
        return;
    };

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

    public static upload_s3(filePath: string, dateKey: string, filename: string, filetype: string, data: any): any {
        var defer = Q.defer();

        var finalFile = filePath.replace('_tmp.', '.');

        const fileName = filename;
        const fileType = filetype;
        var JPEGDecoder = require('jpg-stream/decoder');
        var JPEGEncoder = require('jpg-stream/encoder');



        var sharp = require('sharp');


        const resizer =
            sharp()
                .resize(200, 200)
                //.overlayWith(roundedCorners, { cutout: true })
                .png();




        fs.createReadStream(filePath)
            .pipe(resizer)
            // .pipe(mozjpeg({quality: 50}))
            // .pipe(new JPEGDecoder)
            // .pipe(resize({ width: 500, height: 400, fit: true }))
            // .pipe(new JPEGEncoder({ quality: 70 }))
            .pipe(fs.createWriteStream(finalFile)).on('finish', () => {
                var s3obj = new aws.S3({ params: { Bucket: 'juntas', Key: dateKey + '/' + fileName } });
                s3obj.upload({ Body: fs.createReadStream(finalFile) }).
                    on('httpUploadProgress', function (evt:any) {
                        console.log(evt);
                    }).
                    send(function (err:any, data:any) {
                        console.log(err, data)
                    });
                //s3.getSignedUrl('putObject', s3Params, (err, data) => {
                //    if (err) {
                //        console.log(err);
                //        defer.reject(err);

                //    }
                //    const returnData = {
                //        signedRequest: data,
                //        url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
                //    };

                //    defer.resolve(returnData);

                //});
            });
        return defer.promise;
    }
}
module.exports = thumbler;