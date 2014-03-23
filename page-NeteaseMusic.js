chrombot.startHtml(function(page) {
    chrombot.putLog('page: ' + JSON.stringify(page), 0);
    var frameSelector = '#g_iframe';

    // chrombot.fopen({
    //     path: '歌单.csv',
    //     mode: 'a',
    //     header: '歌曲,作者,专辑,时长\n'
    // });
    //
    var parseSong = function(index, node, albumName, onFinish) {
        var playBtn = jQuery('.ply', node),
            titleNode = jQuery('.txt', node),
            timeNode = jQuery('.s-fc3', node)[0],
            AuthorNode = jQuery('.s-fc3', node)[1],
            AlbumNode = jQuery('.s-fc3', node)[2];

        if (!playBtn.length || !titleNode.length) {
            chrombot.putLog('获取歌曲信息失败，跳过本首歌', 3);
            onFinish();
            return;
        }

        playBtn[0].click();
        var name = titleNode.text() + '.mp3';
        name = name.replace(/[,\r\n\/\\]/g, '');

        var time = timeNode.innerText;
        var author = AuthorNode.innerText;
        var album = AlbumNode.innerText;

        chrombot.putLog('下载歌曲：' + author + ' - ' + name + '  《' + album + '》');
        // chrombot.fwrite({
        //     path: '歌单.csv',
        //     text: name + ',' + author + ',' + album + ',' + time + '\n'
        // });

        chrome.runtime.sendMessage({
            type: 'getMp3',
            savename: author + '-' + name,
            savedir: '~/'+albumName

        }, function(response) {
            if (response.failed) {
                chrombot.putLog('无法下载此首歌曲!', 3);
            }
            onFinish();
        });
    };

    if (page.pageLayer === 0) { //首页
        utils.waitForAjaxInFrame('.m-table .ztag', frameSelector, function(success) {
            if (!success) {
                alert('首页超时！');
            }
            var fm = jQuery(frameSelector)[0].contentDocument;
            var songList = jQuery('.m-table .ztag', fm);
            chrombot.putLog('共发现 ' + songList.length + ' 首歌曲');

            var albumName = jQuery('title').text();
            albumName = albumName.substring(0, albumName.lastIndexOf('-'));
            albumName.trim();
            chrombot.putLog('找到专辑名:' + albumName);
            //chrome.runtime.sendMessage({
                //type: 'getAlbumName_dir',
                //savename:albumName
            //}, function(response) {
                //if (response.failed) {
                    //chrombot.putLog('无法创建专辑目录');
                //}
            //});

            //scheduled to request mp3
            var sIndex = 0;
            var funcDo = function() {
                if (sIndex >= songList.length) {
                    chrombot.finishHtml();
                    return;
                }
                parseSong(sIndex, songList[sIndex], albumName, funcDo);
                sIndex += 1;
            };

            funcDo();
        });
    } else
        window.close();
});
