var rpc = rpc || {};
rpc.onConnected = function(data) {
    console.log('connected');

    //[temp]
    console.log('start a new task: ');
    neteaseBot.taskBegin();
    pagesManager.addPage({
        url: 'http://music.163.com/#/playlist?id=4347227',
        pageIndex: 0
    });
};

(function rpc_main(){
    rpc.serverSocket = io.connect('http://192.168.199.117:5000/super');
    rpc.serverSocket.on('connected', rpc.onConnected);
} ());

