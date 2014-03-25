var chrombot = chrombot || {};

chrombot.putLog = function(text, level, read){
    Utils.sendMsg('putLog', {
        text: text,
        level: level,
        read: read
    });
};

chrombot.startHtml = function(callback){
    Utils.sendMsg('startHtml', null, callback);
};

chrombot.finishHtml = function(obj){
    Utils.sendMsg('finishHtml', obj);
};

chrombot.addHtml = function(orgPageInfo, newPageInfo){
    newPageInfo.pageLayer = orgPageInfo.pageLayer + 1;
    Utils.sendMsg('addHtml', newPageInfo);
};