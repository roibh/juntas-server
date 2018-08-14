var Notification;
var responseFillData;
var backgrounds;
(function (backgrounds) {
    var _self;
    var backgroundWeb = (function () {
        function backgroundWeb() {
            this.socket = {};
            this.activeVideoWindow = null;
            this.socketsInitialized = false;
            this.juntasServer = "";
            this.config = {};
            this.juntastabs = {};
            this.juntaswindows = [];
            this.logger = null;
            this.user = null;
            _self = this;
            this.initSocketEvents();
        }
        backgroundWeb.prototype.handleMessage = function (request, sender, sendResponse) {
            var _this = this;
            this.initSocketEvents();
            var user = this.getUser();
            switch (request.command) {
                case "config loaded":
                    this.config = request.config;
                    sendResponse({ "result": "ok" });
                    break;
                case "juntastabs":
                    sendResponse(this.juntastabs);
                    break;
                case "pop url":
                    chrome.tabs.update(sender.tab.id, { url: request.url }, function () {
                    });
                    break;
                case "pop member":
                    this.socket.emit('pop member', request.tabid, sender.tab.url, request.userid);
                    break;
                case "tab create":
                    var tabKey = "TAB" + request.tab._id;
                    this.juntastabs[tabKey] = request.tab;
                    this.socket.emit('tab create', this.juntastabs[tabKey]);
                    var xtab = this.juntastabs[tabKey];
                    var lastUrl = "";
                    chrome.browserAction.setIcon({ path: "../icons/icon48_on.png" });
                    if (request.activeTab.url.indexOf("chrome:") > -1) {
                        this.juntastabs[tabKey].lastUrl = this.juntasServer + "/juntify/start?j=" + this.juntastabs[tabKey]._id;
                    }
                    else {
                        this.juntastabs[tabKey].lastUrl = request.activeTab.url;
                    }
                    chrome.tabs.update(this.juntastabs[tabKey].TabId, { url: this.juntastabs[tabKey].lastUrl }, function () { });
                    break;
                case "insert tab":
                    var tabKey = "TAB" + request.tab._id;
                    this.juntastabs[tabKey] = request.tab;
                    break;
                case "tab connect":
                    responseFillData = sendResponse;
                    if (user === null) {
                        var url = chrome.extension.getURL('popup.html');
                        chrome.windows.create({ url: url, type: 'panel' });
                        sendResponse({ "result": "nouser" });
                        return;
                    }
                    var tab = request.activeTab;
                    var tabKey = "TAB" + request.tab._id;
                    this.juntastabs[tabKey] = request.tab;
                    var xtab = this.juntastabs[tabKey];
                    xtab.SidebarUiMode == 0;
                    this.socket.emit('tab connect', this.juntastabs[tabKey], user._id);
                    chrome.browserAction.setIcon({ path: "../icons/icon48_on.png" });
                    if (this.juntastabs[tabKey].UserId !== user._id) {
                        if (this.juntastabs[tabKey].History !== undefined && this.juntastabs[tabKey].History.length > 0) {
                            var movingUrl = "";
                            if (this.juntastabs[tabKey].History.length == 1)
                                movingUrl = this.juntastabs[tabKey].History[0].Url;
                            else {
                                var arr = this.juntastabs[tabKey].History.sort(function (a, b) {
                                    a = new Date(a.Date);
                                    b = new Date(b.Date);
                                    return b - a;
                                });
                                movingUrl = arr[0].Url;
                            }
                            chrome.tabs.update(this.juntastabs[tabKey].TabId, { url: movingUrl }, function () {
                                _this.fillMyTab(xtab._id, _this.juntastabs[tabKey].TabId, function () {
                                    sendResponse({ "result": "ok" });
                                });
                            });
                        }
                        else {
                            this.fillMyTab(xtab._id, this.juntastabs[tabKey].TabId, function () {
                                sendResponse({ "result": "ok" });
                            });
                        }
                    }
                    else {
                        xtab.lastUrl = tab.url;
                        this.socket.emit('tab navigate', { TabId: xtab._id, Url: tab.url, UserId: user._id });
                        this.fillMyTab(xtab._id, this.juntastabs[tabKey].TabId, function () {
                            sendResponse({ "result": "ok" });
                        });
                    }
                    break;
                case "fill data":
                    var tabKey = "TAB" + request.tabid;
                    var tabid = sender.tab.id;
                    this.juntastabs[tabKey].load = false;
                    if (sender.tab !== undefined)
                        this.juntastabs[tabKey].TabId = sender.tab.id;
                    responseFillData = sendResponse;
                    this.fillMyTab(this.juntastabs[tabKey]._id, this.juntastabs[tabKey].TabId, function () { });
                    break;
                case "get tabs":
                    sendResponse({ "result": this.juntastabs });
                    break;
                case "get isactive":
                    var t = this.juntastabsById(request.tab.id);
                    sendResponse({ "result": t });
                    break;
                case "get rtc":
                    {
                        var t_1 = this.juntastabs["TAB" + request.hostingTab];
                        if (t_1 !== null && t_1.rtcmessages !== undefined && t_1.rtcmessages.length > 0) {
                            var rtcmessages = t_1.rtcmessages;
                            var res = false;
                            sendResponse({
                                "result": res,
                                "url": "",
                                "tab": t_1,
                                "messages": rtcmessages
                            });
                            t_1.rtcmessages = [];
                        }
                        else {
                            sendResponse({
                                "result": res,
                                "url": "",
                                "tab": t_1
                            });
                        }
                    }
                    break;
                case "get isdirty":
                    {
                        var messages = [];
                        var t_2 = this.juntastabsById(sender.tab.id);
                        var res = false;
                        var smalldirty = false;
                        if (t_2 !== null) {
                            res = (t_2.dirty == true);
                            this.juntastabs["TAB" + t_2._id].dirty = false;
                            messages = t_2.messages;
                            smalldirty = (t_2.smalldirty == true);
                            this.juntastabs["TAB" + t_2._id].smalldirty = false;
                        }
                        sendResponse({
                            "result": res,
                            "smalldirty": smalldirty,
                            "url": sender.tab.url,
                            "tab": t_2, "messages": messages
                        });
                        if (t_2 !== null) {
                            t_2.messages = [];
                        }
                    }
                    break;
                case "delete tab":
                    delete this.juntastabs["TAB" + request.tab._id];
                    break;
                case "scroll tab":
                    clearTimeout(this.emittimeout);
                    this.emittimeout = setTimeout(function () {
                        var user = _this.getUser();
                        if (user !== null) {
                            var t = _this.juntastabsById(sender.tab.id);
                            _this.socket.emit('page scroll', t._id, user._id, request.details);
                        }
                    }, 200);
                    break;
                case "get isjuntas":
                    var t = this.juntastabsById(sender.tab.id);
                    sendResponse({ "result": t !== null, tabid: sender.tab.id });
                    break;
                case "collapse sidebar":
                    var script = "juntasInstance()";
                    var t = this.juntastabsById(sender.tab.id);
                    chrome.tabs.sendMessage(t.TabId, { command: "toggle sidebar", operation: request.operation, tab: t }, function (response) {
                        sendResponse({ "result": "ok" });
                    });
                    break;
                case "set logger":
                    chrome.tabs.executeScript(sender.tab.id, { file: "js/logger.js", "runAt": "document_start" }, function (data) {
                    });
                    break;
                case "set juntas":
                    var t = this.juntastabsById(sender.tab.id);
                    sendResponse({ "result": t !== null });
                    break;
                case "get tabdata":
                    var t = this.juntastabsById(sender.tab.id);
                    if (t !== null)
                        if (this.juntaswindows.indexOf(sender.tab.windowId) < 0)
                            this.juntaswindows.push(sender.tab.windowId);
                    sendResponse({ "result": t });
                    break;
                case "post message":
                    var user = this.getUser();
                    if (user !== null) {
                        var t = this.juntastabsById(sender.tab.id);
                        t.Followers[user._id].isTyping = false;
                        t.smalldirty = true;
                        this.socket.emit('post message', t._id, user._id, request.message);
                        sendResponse({ "result": t });
                    }
                    break;
                case "frame poll":
                    var t = this.juntastabsById(sender.tab.id);
                    sendResponse({ "result": t });
                    break;
                case "delete history":
                    var t = this.juntastabsById(sender.tab.id);
                    this.socket.emit('delete history', t._id, user._id, request._id);
                    break;
                case "like url":
                    var t = this.juntastabsById(sender.tab.id);
                    this.socket.emit('like url', t._id, user._id, request.hash, 5, 'text');
                    break;
                case "webrtc offer":
                    var offer = request.offer;
                    var user = this.getUser();
                    if (user !== null) {
                        this.socket.emit('webrtc send offer', request.hostingTab, user._id, request.offer);
                    }
                    break;
                case "webrtc offer accepted":
                    var offer = request.offer;
                    var t = this.juntastabs["TAB" + request.hostingTab];
                    if (t.UserId !== user._id) {
                        this.socket.emit('webrtc send answer', request.hostingTab, t.UserId, request.offer);
                    }
                    break;
                case "pop video":
                    chrome.windows.onRemoved.addListener(function (windowId) {
                        if (_this.activeVideoWindow !== null && _this.activeVideoWindow.id == windowId)
                            _this.activeVideoWindow = null;
                    });
                    chrome.tabs.getSelected(function (selectedTab) {
                        var tab = _this.juntastabsById(selectedTab.id);
                        if (_this.activeVideoWindow === null) {
                            chrome.windows.create({
                                width: 400,
                                height: 560,
                                top: 0,
                                left: 0,
                                'tabId': selectedTab.id,
                                'type': 'popup',
                                'state': 'docked',
                                'url': chrome.extension.getURL('app/video.html') + '#/' + tab._id
                            }, function (window) {
                                _this.activeVideoWindow = window;
                                sendResponse({ "result": window });
                            });
                        }
                        else {
                        }
                    });
                    break;
                case "webrtc ice candidate":
                    var ice = request.ice;
                    var t = this.juntastabs["TAB" + request.hostingTab];
                    this.socket.emit('webrtc ice candidate', request.hostingTab, t.UserId, request.ice);
                    break;
                case "user is typing":
                    var user = this.getUser();
                    if (user !== null) {
                        var tab = this.juntastabsById(sender.tab.id);
                        this.socket.emit('user is typing', tab._id, user._id);
                    }
                    break;
                case "spawnNotification":
                    var t = this.juntastabsById(sender.tab.id);
                    var tabkey = "TAB" + t._id;
                    this.spawnNotification(request.msg.commentObject.comment.Message, request.msg.commentUser.Picture.data.url, request.msg.commentUser.FirstName + " " + request.msg.commentUser.LastName, sender.tab.id, function () {
                        _this.juntastabs[tabkey].NewCommentCount = "0";
                        _this.juntastabs[tabkey].smalldirty = true;
                        _this.juntastabs[tabkey].messages.push({ "type": "focus" });
                    });
                    break;
            }
        };
        backgroundWeb.prototype.onFacebookLogin = function () {
            var successURL = 'www.facebook.com/connect/login_success.html';
            if (!localStorage.getItem('accessToken')) {
                chrome.tabs.query({}, function (tabs) {
                    for (var i = 0; i < tabs.length; i++) {
                        if (tabs[i].url.indexOf(successURL) !== -1) {
                            var params = tabs[i].url.split('#')[1];
                            var accessToken = params.split('&')[0];
                            accessToken = accessToken.split('=')[1];
                            localStorage.setItem('accessToken', accessToken);
                            chrome.tabs.remove(tabs[i].id);
                        }
                    }
                });
            }
        };
        backgroundWeb.prototype.imagecCickHandler = function (e) {
            var user = _self.getUser();
            if (user !== null) {
                chrome.tabs.getSelected(function (selectedTab) {
                    var tab = _self.juntastabsById(selectedTab.id);
                    console.trace(tab);
                    _self.socket.emit('tab navigate', { TabId: tab._id, Url: e.srcUrl, UserId: user._id });
                });
            }
        };
        ;
        backgroundWeb.prototype.pageClickHandler = function (e) {
            var user = _self.getUser();
            if (user !== null) {
                chrome.tabs.getSelected(function (selectedTab) {
                    var tabid = e.menuItemId.replace("TAB", "").replace("ContextMenu", "");
                    _self.socket.emit('tab navigate', { TabId: tabid, Url: selectedTab.url, UserId: user._id });
                });
            }
        };
        ;
        backgroundWeb.prototype.fillMyTab = function (id, tabid, callback) {
            var _this = this;
            var tabKey = "TAB" + id;
            var r = new XMLHttpRequest();
            r.open("GET", this.juntasServer + "/tabs/fillmytab?_id=" + id, true);
            r.onreadystatechange = function () {
                if (r.readyState != 4 || r.status != 200)
                    return;
                _this.juntastabs[tabKey] = JSON.parse(r.responseText);
                _this.juntastabs[tabKey].TabId = tabid;
                _this.juntastabs[tabKey].dirty = true;
                chrome.browserAction.setIcon({ path: "../icons/icon48_on.png" });
                return callback();
            };
            r.send("_id=" + id);
        };
        backgroundWeb.prototype.juntastabsById = function (id) {
            for (var x in this.juntastabs) {
                if (this.juntastabs[x].TabId == id)
                    return this.juntastabs[x];
            }
            return null;
        };
        backgroundWeb.prototype.initSocketEvents = function () {
            var _this = this;
            if (!this.socketsInitialized) {
                this.socket = io(this.juntasServer);
                var user = this.getUser();
                if (user !== null) {
                    this.socket.emit('juntas connect', { UserId: user._id });
                }
                else {
                    user = this.getAnonimusUser();
                    this.socket.emit('juntas connect', { UserId: user._id, ano: true });
                }
                this.socket.on('tab connected', function (navData) {
                    var tabkey = "TAB" + navData.TabId;
                    if (_this.juntastabs[tabkey] !== undefined) {
                        if (_this.juntastabs[tabkey].Followers === undefined || _this.juntastabs[tabkey].Followers.length > 0)
                            _this.juntastabs[tabkey].Followers = {};
                        _this.juntastabs[tabkey].Followers[navData.User._id] = navData.User;
                        _this.juntastabs[tabkey].Followers[navData.User._id].online = true;
                        if (user._id !== navData.User._id) {
                            _this.spawnNotification("user online", navData.User.Picture.data.url, navData.User.FirstName + " " + navData.User.LastName, navData.TabId);
                        }
                        if (!_this.juntastabs[tabkey].messages)
                            _this.juntastabs[tabkey].messages = [];
                        _this.juntastabs[tabkey].dirty = true;
                        _this.juntastabs[tabkey].messages.push({ "type": "update_user_states", "data": _this.juntastabs[tabkey].Followers });
                    }
                });
                this.socket.on('image captured', function (navData) {
                    var tabkey = "TAB" + navData.TabId;
                    if (_this.juntastabs[tabkey] !== undefined) {
                        _this.juntastabs[tabkey].dirty = true;
                        if (_this.juntastabs[tabkey].reloads === undefined)
                            _this.juntastabs[tabkey].reloads = [];
                        _this.juntastabs[tabkey].reloads.push(navData.FileName);
                        var tab = _this.juntastabs[tabkey];
                        for (var i = 0; i < tab.History.length; i++) {
                            if (tab.History[i].Thumb == navData.FileName) {
                                var d = new Date();
                                tab.History[i].Thumb = tab.History[i].Thumb + "?" + d.getTime();
                            }
                        }
                    }
                });
                this.socket.on('delete history', function (navData) {
                    var tabkey = "TAB" + navData.TabId;
                    if (_this.juntastabs[tabkey] !== undefined) {
                        for (var i = 0; i < _this.juntastabs[tabkey].History.length; i++) {
                            if (_this.juntastabs[tabkey].History[i]._id === navData._id) {
                                _this.juntastabs[tabkey].History.splice(i, 1);
                                _this.juntastabs[tabkey].dirty = true;
                            }
                        }
                    }
                });
                this.socket.on('page scroll', function (navData) {
                    var tabkey = "TAB" + navData.TabId;
                    if (_this.juntastabs[tabkey] !== undefined && _this.juntastabs[tabkey].UserId !== user._id) {
                        chrome.tabs.executeScript(_this.juntastabs[tabkey].TabId, { code: "window.scrollTo(0, " + navData.details.top + ");" }, function (data) {
                        });
                    }
                });
                this.socket.on('webrtc offer accepted', function (navData) {
                    console.trace(user);
                    console.trace(navData);
                    var tabkey = "TAB" + navData.TabId;
                    if (_this.juntastabs[tabkey] !== undefined && _this.juntastabs[tabkey].UserId === user._id) {
                        if (!_this.juntastabs[tabkey].rtcmessages)
                            _this.juntastabs[tabkey].rtcmessages = [];
                        _this.juntastabs[tabkey].rtcmessages.push({ "type": "video_offer_accepted", "data": navData });
                    }
                    ;
                });
                this.socket.on('webrtc ice candidate', function (iceData) {
                    var tabkey = "TAB" + iceData.TabId;
                    if (_this.juntastabs[tabkey] !== undefined && _this.juntastabs[tabkey].UserId !== user._id) {
                        var tabid = _this.juntastabs[tabkey].TabId;
                        if (!_this.juntastabs[tabkey].rtcmessages)
                            _this.juntastabs[tabkey].rtcmessages = [];
                        _this.juntastabs[tabkey].rtcmessages.push({ "type": "ice_candidate", "data": iceData });
                    }
                });
                this.socket.on('webrtc create offer', function (navData) {
                    var tabkey = "TAB" + navData.TabId;
                    if (navData.offer.type !== 'answer') {
                        if (_this.juntastabs[tabkey] !== undefined && _this.juntastabs[tabkey].UserId !== user._id) {
                            var tabid = _this.juntastabs[tabkey].TabId;
                            _this.spawnNotification("video call", null, 'Video chat', tabid, function (tabId) {
                                chrome.windows.onRemoved.addListener(function (windowId) {
                                    if (_this.activeVideoWindow !== null && _this.activeVideoWindow.id == windowId)
                                        _this.activeVideoWindow = null;
                                });
                                if (!_this.juntastabs[tabkey].rtcmessages)
                                    _this.juntastabs[tabkey].rtcmessages = [];
                                if (_this.activeVideoWindow === null) {
                                    _this.juntastabs[tabkey].rtcmessages.push({ "type": "video_offer", "data": navData });
                                    chrome.windows.create({
                                        width: 400,
                                        height: 560,
                                        top: 0,
                                        left: 0,
                                        'tabId': tabid,
                                        'type': 'popup',
                                        'state': 'docked',
                                        'url': chrome.extension.getURL('app/video.html') + '#/' + navData.TabId
                                    }, function (window) {
                                        _this.activeVideoWindow = window;
                                    });
                                }
                            });
                        }
                    }
                    else {
                        _this.juntastabs[tabkey].rtcmessages.push({ "type": "video_answer", "data": navData });
                    }
                });
                this.socket.on('tab navigate', function (navData) {
                    var tabkey = "TAB" + navData.TabId;
                    if (_this.juntastabs[tabkey] !== undefined) {
                        var tabid = _this.juntastabs[tabkey].TabId;
                        chrome.tabs.get(_this.juntastabs[tabkey].TabId, function (selectedTab) {
                            if (_this.juntastabs[tabkey].History === undefined)
                                _this.juntastabs[tabkey].History = [];
                            var found = false;
                            for (var i = 0; i < _this.juntastabs[tabkey].History.length; i++) {
                                if (_this.juntastabs[tabkey].History[i].Url === navData.Map.Url) {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found)
                                _this.juntastabs[tabkey].History.push(navData.Map);
                            _this.juntastabs[tabkey].dirty = true;
                            var user = _this.getUser();
                            if (user !== null) {
                                if (_this.juntastabs[tabkey].UserId !== user._id) {
                                    _this.spawnNotification(navData.Map.Url, _this.imageurl(navData.Map.Thumb, 'url_images'), 'Moving along', tabid);
                                    chrome.tabs.update(selectedTab.id, { url: navData.Map.Url }, function () {
                                    });
                                }
                            }
                        });
                    }
                });
                this.socket.on('public tab navigate', function (navData) {
                    var tabkey = "TAB" + navData.TabId;
                    angular.element("#Starter").scope().$apply(function ($scope) {
                        $scope.latestHistory.push(navData.Map);
                    });
                });
                this.socket.on('pop member', function (navData) {
                    var tabkey = "TAB" + navData.TabId;
                    var d = localStorage.getItem(tabkey);
                    if (d === null)
                        return;
                    if (_this.juntastabs[tabkey] !== undefined) {
                        var tabid = _this.juntastabs[tabkey].TabId;
                        _this.spawnNotification(navData.Map.Url, _this.juntasServer + "/url_images/" + navData.Map.Thumb, 'Openning new tab', navData.TabId);
                    }
                    if (d !== null) {
                        d = JSON.parse(d);
                        if (!d.AllowPop)
                            return;
                    }
                    if (_this.juntastabs[tabkey] !== undefined) {
                        var user = _this.getUser();
                        if (user !== null) {
                            navData.Map.isHistory = true;
                            _this.juntastabs[tabkey].History.push(navData.Map);
                            _this.juntastabs[tabkey].dirty = true;
                            if (_this.juntastabs[tabkey].UserId !== user._id) {
                                chrome.tabs.get(_this.juntastabs[tabkey].TabId, function (selectedTab) {
                                    chrome.tabs.update(selectedTab.id, { url: navData.Map.Url }, function () {
                                    });
                                });
                            }
                        }
                    }
                    else {
                        chrome.tabs.create({ "url": navData.Map.Url, "active": true }, function (tab) {
                            this.juntastabs[tabkey] = { "_id": navData.TabId, TabId: tab.id, load: true, dirty: true };
                        });
                    }
                });
                this.socket.on('commentAdded', function (commentObject, msg) {
                    console.trace("comment aded");
                    var tabkey = "TAB" + commentObject.tabid;
                    if (_this.juntastabs[tabkey] !== undefined) {
                        if (_this.juntastabs[tabkey].NewCommentCount === undefined)
                            _this.juntastabs[tabkey].NewCommentCount = 0;
                        if (_this.juntastabs[tabkey].Comments === undefined)
                            _this.juntastabs[tabkey].Comments = [];
                        var user = _this.getUser();
                        if (user !== null) {
                            _this.juntastabs[tabkey].NewCommentCount++;
                            var commentUser = _this.juntastabs[tabkey].Followers[commentObject.comment.UserId];
                            commentUser.isTyping = false;
                            _this.juntastabs[tabkey].smalldirty = true;
                            if (!_this.juntastabs[tabkey].messages)
                                _this.juntastabs[tabkey].messages = [];
                            _this.juntastabs[tabkey].messages.push({
                                "type": "comment_added", "commentObject": commentObject, "commentUser": commentUser
                            });
                            chrome.tabs.executeScript(_this.juntastabs[tabkey].TabId, { code: "if(!document.orgtitle) document.orgtitle = document.title;document.title = '(" + _this.juntastabs[tabkey].NewCommentCount + ") ' + document.orgtitle" });
                        }
                        commentObject.comment.isComment = true;
                    }
                });
                this.socket.on('like url', function (updateObject, msg) {
                    var tabkey = "TAB" + updateObject.TabId;
                    if (_this.juntastabs[tabkey] !== undefined) {
                        var histories = _this.juntastabs[tabkey].History;
                        for (var x = 0; x < histories.length; x++) {
                            if (histories[x].hash == updateObject.hash) {
                                if (!histories[x].Likes) {
                                    histories[x].Likes = [];
                                }
                                histories[x].Likes.push(updateObject.Map);
                            }
                        }
                        _this.juntastabs[tabkey].dirty = true;
                    }
                });
                this.socket.on('user is typing', function (updateObject) {
                    var tabkey = "TAB" + updateObject.TabId;
                    if (_this.juntastabs[tabkey] !== undefined) {
                        if (_this.juntastabs[tabkey].Followers === undefined || _this.juntastabs[tabkey].Followers.length > 0)
                            _this.juntastabs[tabkey].Followers = {};
                        _this.juntastabs[tabkey].Followers[updateObject.UserId].isTyping = true;
                        setTimeout(function () {
                            _this.juntastabs[tabkey].Followers[updateObject.UserId].isTyping = false;
                            _this.juntastabs[tabkey].smalldirty = true;
                        }, 1000 * 10);
                        _this.juntastabs[tabkey].dirty = true;
                    }
                    ;
                });
                this.socket.on('disconnect', function () {
                    var user = _this.getUser();
                    _this.socket = io.connect(_this.juntasServer);
                    if (user !== null) {
                        _this.socket.emit('juntas connect', { UserId: user._id });
                    }
                    else {
                        user = _this.getAnonimusUser();
                        _this.socket.emit('juntas connect', { UserId: user._id, ano: true });
                    }
                });
                this.socketsInitialized = true;
            }
            return this.socket;
        };
        backgroundWeb.prototype.imageurl = function (input, folder) {
            if (input.indexOf("http") > -1)
                return input;
            else if (input.indexOf("//") == 0)
                return "http:" + input;
            else {
                return this.juntasServer + "/" + folder + "/" + input;
            }
        };
        backgroundWeb.prototype.spawnNotification = function (theBody, theIcon, theTitle, tabId, callback) {
            if (callback === void 0) { callback = undefined; }
            var options = {
                body: theBody,
                icon: theIcon
            };
            var n = new Notification(theTitle, options);
            if (callback) {
                n.onclick = function (x) {
                    chrome.windows.getCurrent(function (window) {
                        window.focused = true;
                        chrome.tabs.update(tabId, { highlighted: true });
                    });
                    n.close();
                    chrome.tabs.executeScript(tabId, { code: "document.title = document.orgtitle;" });
                    if (callback) {
                        callback(tabId);
                    }
                };
            }
            if (!callback) {
                setTimeout(n.close.bind(n), 4000);
            }
        };
        backgroundWeb.prototype.getAnonimusUser = function () {
            if (this.user !== null)
                return this.user;
            else {
                var user = localStorage.getItem("anonimusjuntasuser");
                if (user !== null) {
                    user = JSON.parse(user);
                }
                else {
                    user = { _id: guid() };
                    localStorage.setItem("anonimusjuntasuser", JSON.stringify(user));
                }
                this.user = user;
                return user;
            }
        };
        backgroundWeb.prototype.getUser = function () {
            if (this.user !== null)
                return this.user;
            else {
                var user = localStorage.getItem("juntasuser");
                if (user !== null) {
                    user = JSON.parse(user);
                }
                this.user = user;
                return user;
            }
        };
        return backgroundWeb;
    }());
    var bg1 = new backgroundWeb();
})(backgrounds || (backgrounds = {}));
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
function guid() {
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}
//# sourceMappingURL=backgroundWeb.js.map