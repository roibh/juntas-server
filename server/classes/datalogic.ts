var dal = require('@nodulus/data');
var Q = require('q');
export class DataLogic {

    constructor() {


    }


    public getTabsForUsers(userid:string) {
        var deferred = Q.defer()
        var query = "SELECT * FROM Tabs WHERE Followers in @Followers";
        var promise = dal.query(query, {
            "Followers": [userid]
        }, function (items: any) {
            deferred.resolve(items)
        });
        return deferred.promise;
    }




}
 