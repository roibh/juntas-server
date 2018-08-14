

var winston = require("winston");

class logger {

    winstonLogger: any;
    constructor() {

        var myCustomLevels = {
            levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 },
            colors: {
                info: 'blue',
                warn: 'green',
                critical: 'yellow',
                error: 'red',
                verbose: 'pink',
                debug: 'gray',
                silly: 'brown'
            }
        };

         

        winston.addColors(myCustomLevels.colors);
        this.winstonLogger = new (winston.Logger)({
            levels: myCustomLevels.levels,
            
            level: 'silly',
            transports: [
                new (winston.transports.Console)({ level: 'silly', colorize: true }),
                new (winston.transports.File)({ filename: 'somefile.log', level: 'info' })
            ]
        });

    }

    public log(...args: string[]) {
        this.winstonLogger.log(args);
    }
    public info(...args: string[]) {
        this.winstonLogger.log('info', args);
    }
    public warn(...args: string[]) {
        this.winstonLogger.log('warn', args);
    }
    public debug(...args: string[]) {
        this.winstonLogger.log('debug', args);
    }
    public error(...args: string[]) {
        this.winstonLogger.log('error', args);
    }
}


export default logger;