chrombot.startHtml(function(page) {
    chrombot.putLog('page: ' + JSON.stringify(page), 0);
    var frameSelector = '#g_iframe';
    var songIndex = 0;
    var songList = jQuery();
    var authorName = '',
        title = '';

    var parseSong = function(node, author){
        var playBtn = jQuery('.ply', node);
        var name = utils.getElementAttribute('.txt a', node, 0, 'innerText').replace(/[,\r\n\/\\]/g, '');
        var album = utils.getElementAttribute('.text a.s-fc3', node, 'last', 'innerText').replace(/[,\r\n\/\\]/g, '');
        songIndex += 1;
        if(!author){
            author = utils.getElementAttribute('.text a.s-fc3', node, 0, 'innerText');
        }
        if(!playBtn.length || !name || !album || !author || !title){
            chrombot.putLog('获取歌曲信息失败，跳过本首歌', 3);
            parseList();
        } else {
            playBtn[0].click();
            chrombot.putLog('下载歌曲：' + author + ' - ' + name + '  《' + album + '》');
            chrome.runtime.sendMessage({
                type: 'getMp3',
                savename: author + '-' + name + '.mp3',
                savedir: '~/MUSIC/'+title
            }, function(response) {
                if (response.failed) {
                    chrombot.putLog('无法下载此首歌曲!', 3);
                }
                parseList();
            });
        }
    };

    var parseList = function(){
        if(songIndex === 0){
            chrombot.putLog('共发现 ' + songList.length + ' 首歌曲');
        }
        if(songIndex >= songList.length){
            chrombot.putLog('所有歌曲都已解析完成！');
        } else {
            parseSong(songList.get(songIndex), authorName);
        }
    };

    if (page.pageLayer === 0) { //首页
        utils.waitForAjaxInFrame('.m-table .ztag', frameSelector, function(success) {
            if (!success) {
                alert('首页超时！');
            }
            
            var fm = jQuery(frameSelector)[0].contentDocument;
            songList = jQuery('.m-table .ztag', fm);

            title = jQuery('title').text();
            title = title.substring(0, title.lastIndexOf('-'));
            title.trim();
            chrombot.putLog('找到专辑名:' + title);

            var authorNode = jQuery('#artist-name', fm);
            if(authorNode.length){
                chrombot.putLog('这是一张专辑.');
                authorName = authorNode.text();
            } else {
                chrombot.putLog('这是一张歌单.');
                authorName = '';
            }

            parseList();
        });
    }
});
