chrombot.startHtml(function(page) {
    //[temp]
    page.options = {};
    page.options.topicsOnPage = -1;    // 表示每个页面获取多少个帖子；
    page.options.pagesOnBoard = -1;  // 表示板块最多获取多少页;
    page.options.articlesPerFile = 3; // 表示每多少篇文章保存一个 JSON 文件；
    page.options.savedir = '[Mitbbs]'; // 表示文章保存路径;

    page.options.blockWords = [
        "？",
        "?",
        "本版",
        "Joke版",
        "转载",
        "Re:",
        "RE:",
        "Rt:"
    ];
    // utils.putLog(page, 0);

    if (page.pageLayer === 0) {
        page.boardPageNumber = 1; // it should be;
        page.pageType = 'board';
    }

    if (page.pageType === 'board') {
        var parseTopicsOfBoard = function() {
            var titleSel = 'td strong a.news1';
            var authorSel = 'a.news';

            var checkTitleInBlockWords = function(title){
                title = title || '';
                var blocked = false;
                $.each(page.options.blockWords, function(index, val) {
                    if(title.indexOf(val) !== -1){
                        blocked = true;
                        return false;
                    }
                });
                return blocked;
            };

            $(titleSel).closest('tr').each(function(index, rowEl) {
                if (page.options.topicsOnPage>=0 && index >= page.options.topicsOnPage) {
                    return false;
                }
                var titleNode = $(titleSel, rowEl).closest('td');
                var dataNode = titleNode.next('td');
                var authorNode = dataNode.next('td');

                var info = {};
                info.pageType = 'topic';
                info.articleInfo = {};
                info.articleInfo.title = utils.getElementAttribute(titleSel, rowEl, 0, 'innerText').replace(/^● ?/, '');
                info.articleInfo.url = utils.getElementAttribute(titleSel, rowEl, 0, 'href');
                if(checkTitleInBlockWords(info.articleInfo.title)){
                    chrombot.putLog('Filtered article, title: '+info.articleInfo.title + '  url: '+info.articleInfo.url);
                    return;
                }
                info.url = info.articleInfo.url;

                var nums = Utils.getNumbers(dataNode.text(), /\d+/g);
                info.articleInfo.comments = 0;
                info.articleInfo.readers = 0;
                if (nums.length === 2) {
                    info.articleInfo.comments = nums[0];
                    info.articleInfo.readers = nums[1];
                }
                info.articleInfo.author = $(authorSel, authorNode).text();
                info.articleInfo.authorUrl = Utils.getElementAttribute(authorSel, authorNode, 0, 'href');
                info.articleInfo.date = utils.getElementAttribute('span', authorNode, 0, 'innerText');
                utils.putLog(info, 0);
                chrombot.addHtml(page, info);
            });
        };
        var parseNavOfBoard = function() {
            if (page.boardPageNumber && page.pagesOnBoard >= 0 && page.boardPageNumber >= page.options.pagesOnBoard)
                return false;

            var nextSel = 'a.news:contains("下页")';
            var info = {};
            info.url = utils.getElementAttribute(nextSel, null, 'last', 'href');
            info.pageType = 'board';
            info.boardPageNumber = page.boardPageNumber ? page.boardPageNumber + 1 : 2;
            chrombot.putLog(info, 0);
            chrombot.addHtml(page, info);
        };

        parseTopicsOfBoard();
        parseNavOfBoard();
        chrombot.finishHtml();
    } else if (page.pageType === 'topic') {
        var getNameOfImage = function(url){
            var g = url.match(/[^\/]+[.][^?\/]{3,5}/g);
            if(g && g.length){
                return g[g.length - 1];
            } else{
                return '';
            }
        };
        var parseArticle = function() {
            utils.putLog('parseArticle...', 0);
            var contentSel = 'td.jiawenzhang-type';
            var contentNode = $(contentSel).first();
            page.articleInfo.articleType = '文字';
            if (contentNode.has('img').length) {
                page.articleInfo.articleType = '图片';
                var imgItems = [];
                $('img', contentNode).each(function(index, el) {
                    var item = {url: el.src};
                    item.savedir = (new Date()).toDateString().replace(/ /g, '-');
                    item.savename = Date.now() + '-' + getNameOfImage(el.src);
                    item.saveat = 'upyun';
                    imgItems.push(item);
                });
                page.articleInfo.downloadItems = imgItems;
            }
            if (contentNode.has('object embed').length) {
                // page.articleInfo.articleType = '视频';
                // page.articleInfo.videoUrls = [];
                // $('object embed', contentNode).each(function(index, el) {
                //     page.articleInfo.videoUrls.push(el.src);
                // });
                chrombot.putLog('Video type article, ignore! title: '+ page.articleInfo.title + 'url: '+page.articleInfo.url);
                return;
            }
            utils.putLog(page.articleInfo, 0);
            var content = utils.getElementAttribute(contentSel, null, 0, 'innerText');
            page.articleInfo.content = content.replace(/[\s\S]*发信站.*\n*/, '').replace(/\n+[-][-]\n+[\s\S]*/, '');
            Utils.sendMsg('setArticle', {
                // articlesPerFile: page.options.articlesPerFile,
                // savedir: page.options.savedir,
                articleInfo: page.articleInfo
            });
        };
        
        parseArticle();

        chrombot.finishHtml();
    }

});