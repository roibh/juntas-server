Polymer({
    is: 'juntas-head',
    properties: {


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
        settings: {
            type: Object,
            notify: true

          
        },

        active: {
            type: Boolean,

            notify: true
        },

        searchText: {
            type: String,
            value: ''
        },
        loadingData: Boolean
    },
    observers: [
        '_saveSettings(settings.*)'
    ],
    _saveSettings: function (newValue, oldValue) {         
        if (this.settings.autoPlay !== undefined) {
            var s = localStorage.getItem('juntas-settings');
            if (s !== null)
                s = JSON.parse(s);
            else
                s = {};

            s = this.settings;
            localStorage.setItem('juntas-settings', JSON.stringify(s));
            
        }



    },
    ready: function () {

        // toggle fixed header based on screen size
        var _this = this;
        this.alldata = { users: {}, metadata: {}, tabs: {} };
       // this._loadMetaUrl = '/tabs/metadata';
       

        var s = localStorage.getItem('juntas-settings');
        if (s !== null)
            s = JSON.parse(s);
        else
            s = {};

        this.settings = s;



    },
    _toggleDrawer: function () {
        this.$.drawer.toggle();

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

        // $http.post('/tabs/metadata', {
        //     url: $item.Url
        // }).then(function (response) {

        //     $scope.latestHistoryOrig = angular.copy($scope.latestHistory);
        //     $scope.latestHistory = [];
        //     $item.Meta = response.data;
        //     $item.fromSearch = true;
        //     $scope.appendItem($item);
        // });

    }
});