var cluster = require('cluster');
var net = require('net');
var port = 3020, num_processes = require('os').cpus().length;
num_processes = 1;
if (cluster.isMaster) {
    var workers :any= [];
    var spawn = function (i: number) {
        workers[i] = cluster.fork();
        workers[i].on('exit', function (code:any, signal:any) {
            console.log('respawning worker', i);
            spawn(i);
        });
    };
    for (var i = 0; i < num_processes; i++) {
        spawn(i);
    }
    var worker_index = function (ip:any, len:any) {
        var s = '';
        for (var i = 0, _len = ip.length; i < _len; i++) {
            if (!isNaN(ip[i])) {
                s += ip[i];
            }
        }
        return Number(s) % len;
    };
    var server = net.createServer({ pauseOnConnect: true }, function (connection:any) {
        var worker = workers[worker_index(connection.remoteAddress, num_processes)];
        worker.send('sticky-session:connection', connection);
    }).listen(port);
}
else {
    var app = require('./app.js');
    var server = app.listen(0, 'localhost');
    process.on('message', function (message:any, connection:any) {
        if (message !== 'sticky-session:connection') {
            return;
        }
        server.emit('connection', connection);
        connection.resume();
    });
}
 