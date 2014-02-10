var rpc = rpc || {};
rpc.onConnected = function(data) {
    console.log('connected');
};

rpc.init = function(){
    rpc.serverSocket = io.connect(config.serverIp + ':'+config.serverPort + '/super');
    rpc.serverSocket.on('connected', rpc.onConnected);
};

