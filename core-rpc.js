var rpc = rpc || {};
rpc.onConnected = function(data) {
    utils.putLog('connected');
};

rpc.onNewHtml = function(data) {
    chrombot.htmlRequests -= 1;
    if (!data.htmlInfo) { // no html coming, may means task is finished!
        utils.putLog('There is not new Html on the back!');
        if(pagesManager.hasNoActivePages() && chrombot.htmlRequests === 0){
            chrombot.finshTask();
        } else {
            utils.delayedExecute(1000, function(){
                chrombot.getNewHtml({
                  tabId: data.tabId,
                  number: 1,
                  notClosePage: data.notClosePage
                });
            });
        }
    } else {
        if(!data.htmlInfo.url)
            return false;
        // utils.putLog('get new html: ' + data.htmlInfo.url);
        pagesManager.updatePage(data.htmlInfo, data.tabId);
    }
};

rpc.onDownloadItemsFinished = function(data){
    if(CoreRobot)
        CoreRobot.onDownloadItemsFinished(data);
    else
        utils.putLog('onDownloadItemsFinished, but CoreRobot is not ready!!!', 3);
};

rpc.init = function() {
    rpc.serverSocket = io.connect(config.serverIp + ':' + config.serverPort + '/super');
    rpc.serverSocket.on('connected', rpc.onConnected);
    rpc.serverSocket.on('html', rpc.onNewHtml);
    rpc.serverSocket.on('downloadItemsFinished', rpc.onDownloadItemsFinished);
};