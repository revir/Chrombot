var chrombot = chrombot || {};

chrombot.putLog = function(text, level, read) {
    utils.putLog(text, level, read);
    level = level || 1;
    if (level >= 1) {
        if (rpc.serverSocket && rpc.serverSocket.socket.connected) {
            rpc.serverSocket.emit('putLog', {
                text: text,
                level: level
            });
        }
    }
};

chrombot.addFile = function(data) {
    if (rpc.serverSocket && rpc.serverSocket.socket.connected) {
        rpc.serverSocket.emit('addFile', data);
    } else {
        console.log('[temp] rpc.serverSocket is not ready');
    }
};

chrombot.addHtml = function(data) {
    if (rpc.serverSocket && rpc.serverSocket.socket.connected) {
        rpc.serverSocket.emit('addHtml', data);
    } else {
        console.log('[temp] rpc.serverSocket is not ready');
    }
};

chrombot.htmlRequests = 0;
chrombot.getNewHtml = function(obj) {
    if (rpc.serverSocket && rpc.serverSocket.socket.connected) {
        chrombot.htmlRequests += 1;
        rpc.serverSocket.emit('getHtml', obj);
    } else {
        console.log('[temp] rpc.serverSocket is not ready');
    }
};

chrombot.taskFinished = false;
chrombot.finshTask = function() {
    if (!chrombot.taskFinished) {
        chrombot.taskFinished = true;
        chrombot.putLog('Task finished!');

        CoreRobot.taskEnd();
        // [temp]
        // pagesManager.removeAll();
        rpc.serverSocket.emit('taskFinished');
    }
};

chrombot.writeJSON = function(obj) {
    if (rpc.serverSocket && rpc.serverSocket.socket.connected) {
        rpc.serverSocket.emit('writeJSON', obj);
    } else {
        console.log('[temp] rpc.serverSocket is not ready');
    }
};

chrombot.downloadItems = function(obj) {
    if (rpc.serverSocket && rpc.serverSocket.socket.connected) {
        rpc.serverSocket.emit('downloadItems', obj);
    } else {
        console.log('[temp] rpc.serverSocket is not ready');
    }
};