var globalLanguage = 'en';
var Followers = {};
var Tabs = {};
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
            
            
             if (document.getElementById('juntas-indication') !== null) {
                
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
        
        $scope.$watch('filterGroup', function (new_val, old_val) {
            $scope.pageindex = 0;
            $scope.latestItems();
        }, true)
        
        $scope.appendItem = function (data) {
            
            $Users[data.User._id] = data.User;
            $Tabs[data.TabId] = data.Tab;
            
             
            $History[data.Map._id] = data.Map;
            $History[data.Map._id].metadata = $Metadata[data.Map.hash];
            $History[data.Map._id].group = $Tabs[data.TabId];
            
            if ($History[data.Map._id].group !== undefined)
                $History[data.Map._id].user = $Users[data.User._id];
            
            $scope.latestHistory.push($History[data.Map._id]);
             
            if (data.Meta['og:video:secure_url']) {
                $History[data.Map._id].iframeUrl = $sce.trustAsResourceUrl(data.Meta['og:video:secure_url'] + '&autoplay=1');
                
              
            }
            $scope.showMe($History[data.Map._id]);
          

         

    
        }
        $scope.latestItems = function () {
            $scope.LoadComplete = false;
            $resource('content/latestItems/' + $scope.pageindex).get({ 'order': 1, 'tabid': $scope.filterRequest.TabId, 'userid': $scope.filterRequest.UserId }, function (data) {
                
                
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
                    
                    if ($History[data.history[i]._id].group !== undefined)
                        $History[data.history[i]._id].user = $Users[$History[data.history[i]._id].group.UserId];
                    
                    if ($History[data.history[i]._id].metadata['og:video:secure_url']) {
                        
                        $History[data.history[i]._id].iframeUrl = $sce.trustAsResourceUrl($History[data.history[i]._id].metadata['og:video:secure_url']);
                    }
                    
                    $scope.latestHistory.push($History[data.history[i]._id]);
                    
                }
            
           $scope.LoadComplete = true;
            
        
            })
    
    
        }
        
        $scope.showMe = function (item) {
            //$Players[item._id] = $scope;
             
            $scope.latestHistory.forEach(function (itemx) {
                itemx.visible = false;
            })

            if (item.iframeUrl) {                
                item.visible = true;
            }
            else {
                $scope.PopUrl(item);
            }
            
        }
        $scope.restoreHistory = function () {
            
            $scope.asyncSelected = null;

            $scope.latestHistory = $scope.latestHistoryOrig;

             
        }
        $scope.loadHistory = function () {
            $scope.pageindex++;
            $scope.latestItems();
        }
        
        $scope.PopUrl = function (item) {
            window.open(item.Url);
        }
        
        $scope.filterTab = function (item) {
            if (item == null) {
                $scope.filterRequest.TabId = null;
                $scope.selectedTab = null;
            } else {
                $scope.filterRequest.TabId = item.TabId;
                $scope.selectedTab = $Tabs[item.TabId];
            }
          
        }
       
        $scope.selectSearchItem = function ($item, $model, $label)
        {
            $item.Map = $item;
            $http.post('/tabs/metadata', {
                url: $item.Url
            }).then(function (response) {
                
                
                $scope.latestHistoryOrig = angular.copy($scope.latestHistory);
                $scope.latestHistory = [];
                $item.Meta = response.data;
                $item.fromSearch = true;
                $scope.appendItem($item);
            });

        

        }
        $scope.getSearch = function (term) {
            return $http.get('/content/websearch', {
                params: {
                    Name: term,
                    sensor: false
                }
            }).then(function (response) {
                
                 
                for (var uname in response.data.result.users)
                    $Users[uname] = response.data.result.users[uname];
                

                return response.data.result.items.map(function (item) {
                     
                   
                    item.User = response.data.result.users[item.UserId];
                    item.Tab = response.data.result.tabs[item.TabId];
                    return item;
                });
           

             
            });
            
            
          //  document.location.href = 'https://www.google.com?q=' + $scope.Term + '&oq=' + $scope.Term;
    
    
        }
        $scope.Install = function () {
            chrome.webstore.install('https://chrome.google.com/webstore/detail/behimaeapdpdfokmhjahapambjidjdap', function (data) {
             
            }, function (data) { debugger })

        }
   // $scope.latestItems();

    }])
.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
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
.filter('picture', function ($Users) {
    return function (input) {
        var m = $Users[input];
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
            return m.FirstName + ' ' + m.LastName;
        else
            return '...';
    };
})
.filter('imageurl', ['$Config', function ($Config) {
        return function (input, folder) {
            if (input !== undefined && input !== null) {
                if (input.indexOf('http') > -1)
                    return input;
                else if (input.indexOf('//') == 0)
                    return 'http:' + input;
                else {
                    return $Config.site.apiUrl + '/' + folder + '/' + input;
                }
            }
        };
    }])
.directive('backToTop', [function ($scope, $window) {
        return {
            template: "<div   style='cursor:pointer; position: fixed;bottom: 50px; right: 50px;'><img src='images/back-to-top.png' /></div>",
            link: function (scope, element, attributes) {
                
                scope.element = element;
                angular.element(element).bind('click', function () {
                    $(element).hide();
                    $('html,body').animate({ scrollTop: 0 }, 'slow', function () {
                        $(window).trigger('resize');
                    });

                });
                $(element).hide();
            },
            controller: function ($scope, $window) {
                
                
                
                angular.element($window).bind('scroll', function () {
                    
                    
                    if (($window.innerHeight - $window.pageYOffset) < 0)
                        $($scope.element).show();
                    else
                        $($scope.element).hide();

                });
            }

        }

    }])
.directive('randomPhrases', [function ($scope, $window, $interval) {
        return {
            
            link: function (scope, element, attributes) {
                var phrases = ['go for it', 'yes you may', 'run you fools', 'what is dead, may never die!', 'a lanister always pay his debts'];
                
                var index = Math.floor((Math.random() * phrases.length));
                $(element).attr('placeholder', phrases[index]);

                scope.$interval(function () {
                    var index = Math.floor((Math.random() * phrases.length));
                    $(element).attr('placeholder', phrases[index]);
                }, 1000 * 30);
            },
            controller: function ($scope, $interval) {
                $scope.$interval = $interval;
            
            }
        }
    }])

     

.directive('youtube', [function ($scope, $window, $sce) {
        return {
            template: '<div id="{{item._id}}"></div>' + 
            '<img ng-src="{{item.Thumb | imageurl: \'slide_images\'}}" ng-hide="item.visible" class="img-rounded url-image" />',
            scope: { item: '=' },
            link: function (scope, element, attributes) {                
                // <iframe class="url-image" type="text/html" width="100%" height="390"' + 
                //' ng-src="{{item.iframeUrl}}" frameborder="0" ng-if="visible"></iframe>               
                              
                scope.element = element;
                
                
                var nextElement = element.find('img');
                scope.$watch('item.visible', function (newVal, oldVal) {
                    if (newVal) {
                        var fixed = {
                            height: nextElement.height(),
                            width: nextElement.width()
                        }
                        scope.$timeout(function () {
                            var player = new YT.Player(scope.item._id, {
                                controls: 0,
                                enablejsapi: 1,
                                rel: 0,
                                color: 'white',
                                height: fixed.height,
                                width: fixed.width,
                                autoplay: 1,
                                videoId: YouTubeGetID(scope.item.Url),
                                events: {
                                    'onReady': onPlayerReady,
                           // 'onStateChange': onPlayerStateChange
                                }
                            });
                        }, 100)
                    
                    }
                    else {
                        scope.element.find('iframe').remove();
                        scope.element.append('<div id="' + scope.item._id + '"></div>');
                      
                    }
                });
                
                function onPlayerReady(event) {
                    
                    var player = event.target;
                    var iframe = $('#ytplayer');
                    player.playVideo();
                    
                    
                    // Launch fullscreen for browsers that support it!
//

                    //var requestFullScreen = iframe.requestFullScreen || iframe.mozRequestFullScreen || iframe.webkitRequestFullScreen;
                    //if (requestFullScreen) {
                    //    requestFullScreen.bind(iframe)();
                    //}                     
                }

                             
            },
            controller: function ($scope, $sce, $timeout,$window, $Players) {                
               // $scope.url = $sce.trustAsResourceUrl($scope.url + '?enablejsapi=1');
                if ($scope.visible === undefined)
                    $scope.visible = false;
                // 
                $scope.$timeout = $timeout;
                $Players[$scope.item._id] = $scope;
                
              
                
                
                // Find the right method, call on correct element
                function launchIntoFullscreen(element) {
                    if (element.requestFullscreen) {
                        element.requestFullscreen();
                    } else if (element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if (element.webkitRequestFullscreen) {
                        element.webkitRequestFullscreen();
                    } else if (element.msRequestFullscreen) {
                        element.msRequestFullscreen();
                    }
                }
           

              
            }
        }
    }]);


function YouTubeGetID(url) {
    var ID = '';
    url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    }
    else {
        ID = url;
    }
    return ID;
}

$(function () {
    var tag = document.createElement('script');    
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

})





//var player;
//function onYouTubeIframeAPIReady() {
//    player = new YT.Player('player', {
//        height: '390',
//        width: '640',
//        videoId: 'M7lc1UVf-VE',
//        events: {
//           // 'onReady': onPlayerReady,
//           // 'onStateChange': onPlayerStateChange
//        }
//    });
//}






