var chrombot = chrombot || {};

chrombot.putLog = function(text, level, read){
    var logfuns = [console.log, console.info, console.warn, console.error];
    level = level && (level < 4) ? level : 1;
    logfuns[level].call(console, text);
};

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

chrombot.getNewHtml = function(obj){
    if(rpc.serverSocket && rpc.serverSocket.socket.connected){
        rpc.serverSocket.emit('getHtml', obj);
    } else {
        console.log('[temp] rpc.serverSocket is not ready');
    }
};