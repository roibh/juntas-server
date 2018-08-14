var globalLanguage = 'en';
var Followers = {};
var Tabs = {};
<<<<<<< HEAD
angular.module('JuntasApp', ['ngResource']).
    service('$Users', function () {
        var Users = {};
        return Users;
    }).
    service('$Tabs', function () {
        var Tabs = {};
        return Tabs;

    }).
    service('$Metadata', function () {
        var Metadata = {};
        return Metadata;

    }).
    service('$History', function () {
        var History = {};
        return History;

    }).
    service('$Players', function () {
        var Players = {};
        return Players;

    }).
    controller('Starter', ['$scope', '$Config', '$resource', '$timeout', '$http', '$interval', '$sce', '$Tabs', '$History', '$Users', '$Metadata', function ($scope, $Config, $resource, $timeout, $http, $interval, $sce, $Tabs, $History, $Users, $Metadata) {
        $scope.$History = $History;
        $scope.$Tabs = $Tabs;
        $scope.$Users = $Users;
        $scope.$Metadata = $Metadata;

        $scope.ExtensionInstalled = false;
        $scope.CheckComplete = false;
        $scope.LoadComplete = false;
        var checkCount = 0;

        var checkInterval = $interval(function () {
            checkCount++;

            if (checkCount > 5) {
                document.getElementById('install-button').style.display = 'block';
                $scope.CheckComplete = true;
                $interval.cancel(checkInterval);
            }
=======
angular.module("JuntasApp", ["ngResource", "gettext","infinite-scroll"]).
service("$Users", function () {
    var Users = {};
    return Users;
}).
service("$Tabs", function () {
    var Tabs = {};
    return Tabs;

}).
service("$Metadata", function () {
    var Metadata = {};
    return Metadata;

}).
service("$History", function () {
    var History = {};
    return History;

}).
controller("Starter", function ($scope, $Config, $resource, $timeout, $interval, $Tabs, $History, $Users, $Metadata) {
    $scope.$History = $History;
    $scope.$Tabs = $Tabs;
    $scope.$Users = $Users;
    $scope.$Metadata = $Metadata;

    $scope.ExtensionInstalled = false;
    $scope.CheckComplete = false;
    var checkCount = 0;
    
    var checkInterval = $interval(function () {
        checkCount++;
        
        if (checkCount > 5) {
            document.getElementById('install-button').style.display = 'block';
            $scope.CheckComplete = true;
            $interval.cancel(checkInterval);
        }
        
        
        if (document.getElementById("juntas-indication") !== null) {
            
            $scope.ExtensionInstalled = true;
            $scope.CheckComplete = true;
            $interval.cancel(checkInterval);
            
            $Config.ready(function () {
                $scope.CheckComplete = true;
                 


            });
        }
         
    }, 1000);
    $scope.latestHistory = [];
    $scope.pageindex = 0;
    $scope.filterRequest = { TabId: null };
    $scope.filterGroup = function (fitem) {
        return fitem.TabId === $scope.filterRequest.TabId || $scope.filterRequest.TabId === null;
    };
    
    $scope.$watch("filterGroup", function (new_val, old_val) {
        $scope.pageindex = 0;
        $scope.latestItems();
    },true)
    

    $scope.latestItems = function () {
        $resource("content/latestItems/" + $scope.pageindex ).get({"order": 1, "tabid": $scope.filterRequest.TabId, "userid": $scope.filterRequest.UserId  }, function (data) {
            
           
            for (var i = 0; i < data.users.length; i++) {
                $Users[data.users[i]._id] = data.users[i];
                Followers[data.users[i]._id] = $Users[data.users[i]._id];
            }
            for (var i = 0; i < data.tabs.length; i++) {
                $Tabs[data.tabs[i]._id] = data.tabs[i];
            }
             
             
            for (var i = 0; i < data.metadata.length; i++) {
                $Metadata[data.metadata[i].hash] = data.metadata[i];
            }
            

            for (var i = 0; i < data.history.length; i++) {
                $History[data.history[i]._id] = data.history[i];
                $History[data.history[i]._id].metadata = $Metadata[data.history[i].hash];
                $History[data.history[i]._id].group = $Tabs[data.history[i].TabId];
                 
                if($History[data.history[i]._id].group!== undefined)
                        $History[data.history[i]._id].user = $Users[$History[data.history[i]._id].group.UserId];

                $scope.latestHistory.push($History[data.history[i]._id]);
            }
            
           
            
        
        })
    
    
    }
    
    $scope.loadHistory = function () {
        $scope.pageindex++;
        $scope.latestItems();    
    }
    
    $scope.PopUrl = function (item) { 
        window.open(item.Url);    
    }
    

    $scope.Search = function () {
        
        document.location.href = "https://www.google.com?q=" + $scope.Term + "&oq=" + $scope.Term;
    
    
    }
    $scope.Install = function () {
        chrome.webstore.install('https://chrome.google.com/webstore/detail/behimaeapdpdfokmhjahapambjidjdap', function (data) {
             
        }, function (data) { debugger})

    }
    $scope.latestItems();

})
.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });
                
                event.preventDefault();
            }
        });
    };
})
.filter('displaydate', function () {
    return function (input) {
        var m = moment(input);
        return m.locale(globalLanguage).calendar();
    };
})
.filter('picture', function () {
    return function (input) {
        var m = Followers[input];
        if (m !== undefined)
            return m.Picture.data.url;
    };
})
.filter('properalign', function () {
    return function (input) {
        var code = input.charCodeAt(0);
        if (code > 1000) {
            return "<p class='rtl'>" + input.linkify() + "</p>";
        }
        else {
            return "<p class='ltr'>" + input.linkify() + "</p>";
        }
    };
})
.filter('username', function () {
    return function (input) {
        var m = Followers[input];
        if (m !== undefined)
            return m.FirstName + " " + m.LastName;
        else
            return "...";
    };
})
.filter('imageurl', function ($Config) {
    return function (input, folder) {
        if (input !== undefined && input !== null) {
            if (input.indexOf("http") > -1)
                return input;
            else if (input.indexOf("//") == 0)
                return "http:" + input;
            else {
                return $Config.site.apiUrl + "/" + folder + "/" + input;
            }
        }
    };
});
>>>>>>> 452638d638b0b22d644458244fcde2300990a0cb


            if (document.getElementById('juntas-indication') !== null) {

                $scope.ExtensionInstalled = true;
                $scope.CheckComplete = true;
                $interval.cancel(checkInterval);

                $Config.ready(function () {
                    $scope.CheckComplete = true;



                });
            }

        }, 1000);


    }]);



