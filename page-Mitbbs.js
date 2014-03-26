chrombot.startHtml(function(page) {
    //[temp]
    page.options = {};
    page.options.topicsOnPage = 4;
    page.options.pagesOnBoard = 18;
    page.options.articlesPerFile = 3;
    page.options.savedir = '[Mitbbs]';
    utils.putLog(page, 0);

    if (page.pageLayer === 0) {
        page.boardPageNumber = 1; // it should be;
        page.pageType = 'board';
    }

    if (page.pageType === 'board') {
        var parseTopicsOfBoard = function() {
            var titleSel = 'td strong a.news1';
            var authorSel = 'a.news';
            $(titleSel).closest('tr').each(function(index, rowEl) {
                if (index >= page.options.topicsOnPage) {
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
            if (page.boardPageNumber && page.boardPageNumber >= page.options.pagesOnBoard)
                return false;

            var nextSel = 'a.news:contains("下页")';
            var info = {};
            info.url = utils.getElementAttribute(nextSel, null, 'last', 'href');
            info.pageType = 'board';
            info.boardPageNumber = page.boardPageNumber ? page.boardPageNumber + 1 : 2;
            utils.putLog(info, 0);
            chrombot.addHtml(page, info);
        };

        parseTopicsOfBoard();
        parseNavOfBoard();
        chrombot.finishHtml();
    } else if (page.pageType === 'topic') {
        var parseArticle = function() {
            var contentSel = 'td.jiawenzhang-type p';
            var contentNode = $(contentSel).first();
            page.articleInfo.articleType = '文字';
            if (contentNode.has('img').length) {
                page.articleInfo.articleType = '图片';
                page.articleInfo.imgUrls = [];
                $('img', contentNode).each(function(index, el) {
                    page.articleInfo.imgUrls.push(el.src);
                });
            }
            if (contentNode.has('object embed').length) {
                page.articleInfo.articleType = '视频';
                page.articleInfo.videoUrls = [];
                $('object embed', contentNode).each(function(index, el) {
                    page.articleInfo.videoUrls.push(el.src);
                });
            }
            page.articleInfo.content = utils.getElementAttribute(contentSel, null, 0, 'innerText');
            Utils.sendMsg('setArticle', {
                articlesPerFile: page.options.articlesPerFile,
                savedir: page.options.savedir,
                articleInfo: page.articleInfo
            });
        };
        
        parseArticle();

        chrombot.finishHtml();
    }

});