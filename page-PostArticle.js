chrombot.startHtml(function(page) {
    if(location.href === 'http://kooteq.com/new-thread/'){
        var article = page.articleInfo;
        utils.sendMsg('saveTooken', {
            tooken: document.all.csrfmiddlewaretoken.value
        });
        chrombot.finishHtml({
            noUpdate: true
        });
        //no other action, just wait at here!
    }else{
        chrombot.putLog('wrong page! location.href: '+location.href, 3);
        chrombot.finishHtml();
    }
});