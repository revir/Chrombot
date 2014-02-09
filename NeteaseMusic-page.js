chrombot.startHtml(function(page) {
    var pageData = page.data && page.data.length ? JSON.parse(page.data) : {};
    var curLocation = location.href;

    chrombot.putLog('page: ' + JSON.stringify(page), 0);
    var frameSelector = '#g_iframe';

    // chrombot.fopen({
    //     path: '歌单.csv',
    //     mode: 'a',
    //     header: '歌曲,作者,专辑,时长\n'
    // });

    var parseSong = function(index, node, onFinish) {
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
            savename: author + '-' + name
        }, function(response) {
            if (response.failed) {
                chrombot.putLog('无法下载此首歌曲!', 3);
            }
            onFinish();
        });
    };

    if (page.pageIndex === 0) { //首页
        utils.waitForAjaxInFrame('.m-table .ztag', frameSelector, function(success) {
            if (!success) {
                alert('首页超时！');
            }
            var fm = jQuery(frameSelector)[0].contentDocument;
            var songList = jQuery('.m-table .ztag', fm);
            chrombot.putLog('共发现 ' + songList.length + ' 首歌曲');

            //scheduled to request mp3
            var sIndex = 0,
                interval = 1000;
            var funcDo = function() {
                if (sIndex >= songList.length) {
                    window.clearInterval(id);
                    // window.close();
                    return;
                }
                parseSong(sIndex, songList[sIndex], funcDo);
                sIndex += 1;
            };
            var id = window.setInterval(funcDo, interval);
        });
    } else
        window.close();
});