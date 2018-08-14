Polymer({
    is: 'juntas-block',
    properties: {

        item: {
            type: Object,

        },

        _loadMetaUrl: {
            type: String,
            notify: true
        },

        _loadMetaBody: {
            type: String,
            notify: true
        },
        loadingData: Boolean
    },
    ready: function () {

    },
    _isVideo: function (item) {

        return item.videoId !== null && item.videoId !== undefined;
    },
    observers: [

    ]
});