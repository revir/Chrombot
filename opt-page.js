$(document).click(function(e){
    var target = $(e.target);
    if(target.is('.neteaseMusic')){
        bootbox.prompt('URL:', function(result){
            if(!result) //[temp] test
                result = 'http://music.163.com/#/album?id=2767188';

            if(result && result.length){
                //[temp]
                utils.putLog('start a new task: ');
                utils.sendMsg('startTask', {
                    url: result,
                    taskType: 'neteaseMusic'
                });
            }
        });
    } else if(target.is('.mitbbs')){
        bootbox.prompt('URL:', function(result){
            if(!result)
                result = 'http://www.mitbbs.com/bbsdoc/Joke.html';

            if(result){
                utils.putLog('start a new task: '+result);
                utils.sendMsg('startTask', {
                    url: result,
                    taskType: 'mitbbs'
                });
            }
        });
    }
});