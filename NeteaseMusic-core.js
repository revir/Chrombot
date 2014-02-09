var neteaseBot = {};
neteaseBot._mp3pool = [];
neteaseBot.__taskStarted = false;

neteaseBot.downloadMp3 = function(url, name, dir) {
    chrombot.addFile({
        url: url,
        savename: name
    });
};

neteaseBot.request_callback = function(detail) {
    if (/.*[.]mp3$/.test(detail.url)) {
        if (jQuery.grep(neteaseBot._mp3pool, function(e) {
            return e.url === detail.url;
        }).length) {
            return;
        }

        chrombot.putLog('mp3: ' + detail.url, 0);
        neteaseBot._mp3pool[neteaseBot._mp3pool.length] = {
            url: detail.url
        };
        return {
            cancel: true
        };
    }
};

neteaseBot.taskBegin = function(){
    if (!neteaseBot.__taskStarted) {
        chrome.webRequest.onBeforeRequest.addListener(function request_callback(detail){
            if (/.*[.]mp3$/.test(detail.url)) {
                if (jQuery.grep(neteaseBot._mp3pool, function(e) {
                    return e.url === detail.url;
                }).length) {
                    return;
                }

                chrombot.putLog('mp3: ' + detail.url, 0);
                neteaseBot._mp3pool[neteaseBot._mp3pool.length] = {
                    url: detail.url
                };
                return {
                    cancel: true
                };
            }
        }, {
            urls: ["*://*.126.net/*"]
        }, ["blocking"]);
    }
};

neteaseBot.taskEnd = function(){
    if (neteaseBot.__taskStarted) {
        chrome.webRequest.onBeforeRequest.removeListener(neteaseBot.request_callback);
        neteaseBot.__taskStarted = false;
    }
};

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'getMp3') {
            var timeOut = 5000;
            var interval = 500;

            var funcDo = function() {
                chrombot.putLog('funcDo...', 0);
                timeOut -= interval;
                if (neteaseBot._mp3pool.length && !neteaseBot._mp3pool[neteaseBot._mp3pool.length - 1].savename) {
                    window.clearInterval(id);
                    neteaseBot._mp3pool[neteaseBot._mp3pool.length - 1].savename = request.savename;

                    neteaseBot.downloadMp3(neteaseBot._mp3pool[neteaseBot._mp3pool.length - 1].url, neteaseBot._mp3pool[neteaseBot._mp3pool.length - 1].savename, request.savedir);

                    sendResponse({
                        succeed: true
                    });
                    return;
                }
                if (timeOut <= 0) {
                    window.clearInterval(id);
                    sendResponse({
                        failed: true
                    });
                    return;
                }
            };
            var id = window.setInterval(funcDo, interval);
            return true;
        }
    }
);