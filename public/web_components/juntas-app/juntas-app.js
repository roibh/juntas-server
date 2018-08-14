Polymer({
    is: 'juntas-app',
    properties: {
        items: {
            type: Array,
            value: [],
            notify: true
        },
        perPage: {
            type: Number,
            value: 100
        },
        searchPlaceholder: {
            type: String,
            notify: true
        },

        _loadMetaUrl: {
            type: String,
            notify: true
        },

        _loadMetaBody: {
            type: String,
            notify: true
        },


        page: {
            type: Number,
            value: 0
        },

        searchText: {
            type: String,
            value: ''
        },
        history: { type: Array, value: [] },
        alldata: { users: {}, metadata: {}, tabs: {} },
        loadingData: Boolean
    },
    ready: function () {
        if (window.APPINIT)
            return;


        // toggle fixed header based on screen size
        var _this = this;
        //this.alldata = { users: {}, metadata: {}, tabs: {} };
       // this._loadMetaUrl = '/tabs/metadata';
        var pendingNotification = null;
        this.socket = io();
        user = this._getAnonimusUser();
        this.socket.emit('juntas connect', { UserId: user._id, ano: true });




        this.socket.on('public tab navigate', (navData) => {
            var Map = navData.Map;
            Map.videoId = this._youTubeGetID(Map.Url);
            Map.autoPlay = 1;
            Map.tab = _this.properties.alldata.tabs[Map.TabId];
            Map.user = _this.properties.alldata.users[Map.UserId];

            _this.unshift('items', Map);
            _this.$.scrollThreshold.clearTriggers();
            _this.$.ItemList.fire('iron-resize');
            window.dispatchEvent(new Event('resize'));
            var options = {
                body: Map.Title,
                icon: Map.Thumb
            }

            function validateImage(thumb, bad, good) {
                var img = new Image();
                img.onload = good;
                img.onerror = bad;
                img.src = Map.Thumb;

            }
            function good() {
                Notification.requestPermission().then(function (result) {
                    var n = new Notification(Map.Title, options);
                });

            }
            function bad() {
                setTimeout(function () {
                    validateImage(Map.Thumb, bad, good);
                }, 500);
            }
            validateImage(Map.Thumb, bad, good);
        });
        window.APPINIT = true;

        // socket.on('chat message', function (msg) {
        //     var shadow = document.createElement('paper-shadow');
        //     shadow.innerHTML = msg;
        //     messagesList.appendChild(shadow);
        // });


    },
    observers: [
        '_routePageChanged(routeData.page)'
    ],

    _routePageChanged: function (page) {
        this.page = page || 0;
    },
    _youTubeGetID: function (url) {
        var ID = '';
        url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        if (url[2] !== undefined) {
            ID = url[2].split(/[^0-9a-z_\-]/i);
            ID = ID[0];
        }
        else {
            ID = undefined;
        }
        return ID;
    },

    _didReceiveResponse: function (e) {
        var payload = e.detail.response;

        var _this = this;
        payload.users.map(function (user) {
            _this.properties.alldata.users[user._id] = user;
        });
        payload.metadata.map(function (meta) {
            _this.properties.alldata.metadata[meta._id] = meta;
        });
        payload.tabs.map(function (tab) {
            _this.properties.alldata.tabs[tab._id] = tab;
        });





        for (var i = 0; i < payload.history.length; i++) {

            payload.history[i].videoId = this._youTubeGetID(payload.history[i].Url);
            payload.history[i].autoPlay = 1;
            payload.history[i].tab = _this.properties.alldata.tabs[payload.history[i].TabId];
            payload.history[i].user = _this.properties.alldata.users[payload.history[i].UserId];
            // _this.properties.items.value.push(payload.history[i]);
            _this.push('items', payload.history[i]);

            // _this.$.ItemList.push('items', payload.history[i]);

        }


        this.$.scrollThreshold.clearTriggers();

    },
    _onLowerThreshold: function () {

        // this.$.scrollThreshold.clearTriggers();
        this.debounce('_loadItems', this._loadMoreItems, 60);
    },

    _getAnonimusUser() {
        if (this.user)
            return this.user;
        else {
            var user = localStorage.getItem("anonimusjuntasuser");
            if (user !== null) {
                user = JSON.parse(user);
            }
            else {
                user = { _id: guid() }
                localStorage.setItem("anonimusjuntasuser", JSON.stringify(user));
            }
            this.user = user;
            return user;
        }
    },

    _loadMoreItems: function () {
        this.page++;
        this.$.ajax.generateRequest();
    },

    _loadItems: function (term, page) {

        return '/content/latestItems/' + page;
    },

    _loadSearchItems: function (term, page) {
        return '/content/websearch?Name=' + term + '&sensor=false';
    },


    _getMetaParams: function (url) {
        return { 'url': url };
    },
    _selectSearchItem: function (e) {
        var item = e.detail.response;

        //this._loadMetaBody = item.Url;
        // $item.Map = $item;
        // $http.post('/tabs/metadata', {
        //     url: $item.Url
        // }).then(function (response) {

        //     $scope.latestHistoryOrig = angular.copy($scope.latestHistory);
        //     $scope.latestHistory = [];
        //     $item.Meta = response.data;
        //     $item.fromSearch = true;
        //     $scope.appendItem($item);
        // });

    },

    _pageChanged: function (page) {
        // Load page import on demand. Show 404 page if fails
        var resolvedPageUrl = this.resolveUrl('my-' + page + '.html');
        this.importHref(resolvedPageUrl, null, this._showPage404, true);
    },

    _showPage404: function () {
        this.page = 'view404';
    }




});


function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function guid() {
    guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    return guid;
}

