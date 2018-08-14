Polymer({
    is: 'juntas-search',
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


        var phrases = ['go for it', 'yes you may', 'run you fools', 'what is dead, may never die!', 'a lanister always pay his debts'];

        var index = Math.floor((Math.random() * phrases.length));
        this.searchPlaceholder = phrases[index];
        setInterval(function () {
            var index = Math.floor((Math.random() * phrases.length));
            _this.searchPlaceholder = phrases[index];
        }, 1000 * 10);

    },

    _didReceiveSearchResponse: function (e) {
        var payload = e.detail.response.result;
        this.$.searchInput.source = payload.items;

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



