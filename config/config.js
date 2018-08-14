module.exports = {
    "name": "testing all node options",
    "url": "",
    "port": "3030",
    "proport": "80",
    "appRoot": "/",
    "defaultPage": "public/index.html",
    "env": {
        "NODE_ENV": "production",
        "AWS_ACCESS_KEY_ID": "AKIAJJQG5GURO5TMIAHA",
        "AWS_SECRET_ACCESS_KEY": "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",
        "S3_BUCKET": "juntas"
    },
    "database": {
        "mongodb": {
            "useObjectId": true,
            "host": "mongodb://juntas:juntas$sa@ds049624.mongolab.com:49624/juntas"
            //"host": "mongodb://localhost:27017/juntas"
        }
    },
    "plugins": [
        "webrtc",
        "user",
        "tabs",
        "kidmon"
    ],
    "mimeTypes": {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
        ".less": "text/less",
        ".json": "application/json",
        ".ttf": "application/font-woff",
        ".woff": "application/font-woff"
    },
    "logs": {
        "transports": [
            {
                "type": "winston.transports.File",
                "name": "info-file",
                "filename": "./logs/filelog-info.log",
                "level": "info"
            },
            {
                "type": "winston.transports.File",
                "name": "error-file",
                "filename": "./logs/filelog-error.log",
                "level": "error"
            },
            {
                "type": "winston.transports.File",
                "name": "warn-file",
                "filename": "./logs/filelog-warn.log",
                "level": "warn"
            },
            {
                "type": "winston.transports.Console",
                "name": "debug-file",
                "level": "debug"
            }
        ]
    }
}