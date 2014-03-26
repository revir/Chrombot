var chrombot = chrombot || {};

chrombot.putLog = utils.putLog;

chrombot.addFile = function(data){
    if(rpc.serverSocket && rpc.serverSocket.socket.connected){
        rpc.serverSocket.emit('addFile', data);
    } else {
        console.log('[temp] rpc.serverSocket is not ready');
    }
};

chrombot.addHtml = function(data){
    if(rpc.serverSocket && rpc.serverSocket.socket.connected){

        rpc.serverSocket.emit('addHtml', data);
    } else {
        console.log('[temp] rpc.serverSocket is not ready');
    }
};

chrombot.htmlRequests = 0;
chrombot.getNewHtml = function(obj){
    if(rpc.serverSocket && rpc.serverSocket.socket.connected){
        chrombot.htmlRequests += 1;
        rpc.serverSocket.emit('getHtml', obj);
    } else {
        console.log('[temp] rpc.serverSocket is not ready');
    }
};

chrombot.writeJSON = function(obj){
    if(rpc.serverSocket && rpc.serverSocket.socket.connected){
        rpc.serverSocket.emit('writeJSON', obj);
    } else {
        console.log('[temp] rpc.serverSocket is not ready');
    }
};