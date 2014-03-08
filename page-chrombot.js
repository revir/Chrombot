var chrombot = chrombot || {};

chrombot.putLog = function(text, level, read){
    var logfuns = [console.log, console.info, console.warn, console.error];
    level = level && (level < 4) ? level : 1;
    logfuns[level].call(console, text);
};

chrombot.startHtml = function(callback){
    Utils.sendMsg('startHtml', null, callback);
};