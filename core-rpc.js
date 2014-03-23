var rpc = rpc || {};
rpc.onConnected = function(data) {
    console.log('connected');
};

rpc.onNewHtml = function(data){
    console.log('get one new html: '+data.url);
    pagesManager.updatePage(data, data['tabId']);
};

rpc.init = function(){
    rpc.serverSocket = io.connect(config.serverIp + ':'+config.serverPort + '/super');
    rpc.serverSocket.on('connected', rpc.onConnected);
    rpc.serverSocket.on('html', rpc.onNewHtml);
};

