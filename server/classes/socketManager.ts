export class SocketManager {
    sockets: any = {};
    rooms: any = {};
    users: any = {};
    constructor() {
        this.sockets = {};

    }
    public identifySocket(socket: any, userid: string) {
        if (!this.sockets) {
            this.sockets = {};
        }
        this.sockets[userid] = socket;
    };
    public createRoom(): void {


    }
    public joinRoom(tabid: string, socket: any): void {
        if (socket && socket !== null) {
            if (!socket.rooms["/#" + tabid])
                socket.join(tabid);
        }
    }
    public leaveRoom(): void {
    }
    public ensureOnlineState(tabid: string, userid: string): void {
        if (global.Rooms[tabid] === undefined) {
            global.Rooms[tabid] = {};
            global.Rooms[tabid].online = {};
            global.Rooms[tabid].online[userid] = new Date();
        }
        else {
            if (!global.Rooms[tabid].online)
                global.Rooms[tabid].online = {};

            global.Rooms[tabid].online[userid] = new Date();

        }


    }
    public isUserOnline(userid: string) {
        return this.sockets[userid] !== undefined;
    };
    public takeOffline(userid: string) {
        if (this.sockets[userid])
            delete this.sockets[userid];

    };
    public addToRooms(socket: any,  items: any) {
        for (var i = 0; i < items.length; i++) {
            var tid = items[i]._id.toString();


            //join all the groups for this user
            this.joinRoom(tid, socket)






        }
    }

}
exports.SocketManager = SocketManager;


