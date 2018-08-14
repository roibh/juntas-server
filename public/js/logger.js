


window.onscroll = function () {    
    var top = window.pageYOffset || document.documentElement.scrollTop,
    left = window.pageXOffset || document.documentElement.scrollLeft;
    chrome.runtime.sendMessage({ command: "scroll tab", details: { top: top, left: left } }, function (response) {
    });
}


