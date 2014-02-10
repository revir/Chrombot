$(document).click(function(e){
    var target = $(e.target);
    if(target.is('.neteaseMusic')){
        bootbox.prompt('URL:', function(result){
            if(result && result.length){
                //[temp]
                utils.putLog('start a new task: ');
                utils.sendMsg('startTask', {
                    url: result,
                    taskType: 'neteaseMusic'
                });
            }
        });
    }
});