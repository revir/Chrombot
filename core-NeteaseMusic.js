function NeteaseBot(botType) {
    NeteaseBot.superClass.constructor.apply(this, arguments);
    NeteaseBot._mp3pool = [];
    NeteaseBot.__taskStarted = false;
}

Utils.extend(NeteaseBot, Basebot);

NeteaseBot.prototype.taskBegin = function() {
    if (!NeteaseBot.__taskStarted) {
        chrome.webRequest.onBeforeRequest.addListener(this.request_callback, {
            urls: ["*://*.126.net/*"]
        }, ["blocking"]);
        chrome.runtime.onMessage.addListener(this.msg_callback);
        chrombot.putLog('Task begin!');
    }
};

NeteaseBot.prototype.taskEnd = function() {
    if (NeteaseBot.__taskStarted) {
        chrome.webRequest.onBeforeRequest.removeListener(this.request_callback);
        chrome.runtime.onMessage.removeListener(this.msg_callback);
        NeteaseBot.__taskStarted = false;
        chrombot.putLog('Task end!');
    }
};

NeteaseBot.prototype.downloadMp3 = function(url, name, dir) {
    chrombot.putLog('===========' + dir);
    chrombot.addFile({
        url: url,
        savename: name,
        savedir: dir
    });
};

NeteaseBot.prototype.request_callback = function(detail) {
    if (/.*[.]mp3$/.test(detail.url)) {
        if (jQuery.grep(NeteaseBot._mp3pool, function(e) {
            return e.url === detail.url;
        }).length) {
            return;
        }

        chrombot.putLog('mp3: ' + detail.url, 0);
        NeteaseBot._mp3pool[NeteaseBot._mp3pool.length] = {
            url: detail.url
        };
        return {
            cancel: true
        };
    }
};

NeteaseBot.prototype.msg_callback = function(request, sender, sendResponse) {
    if (request.type === 'getMp3') {
        var timeOut = 5000;
        var interval = 500;

        var funcDo = function() {
            chrombot.putLog('funcDo...', 0);
            timeOut -= interval;
            if (NeteaseBot._mp3pool.length && !NeteaseBot._mp3pool[NeteaseBot._mp3pool.length - 1].savename) {
                window.clearInterval(id);
                NeteaseBot._mp3pool[NeteaseBot._mp3pool.length - 1].savename = request.savename;

                NeteaseBot.prototype.downloadMp3(NeteaseBot._mp3pool[NeteaseBot._mp3pool.length - 1].url, NeteaseBot._mp3pool[NeteaseBot._mp3pool.length - 1].savename, request.savedir);

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
};

