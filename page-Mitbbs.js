chrombot.startHtml(function(page) {
    //[temp]
    page.options = {};
    page.options.topicsOnPage = 2;
    page.options.pagesOnBoard = 1;
    utils.putLog(page, 0);

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
            info.title = utils.getElementAttribute(titleSel, rowEl, 0, 'innerText').replace(/^● ?/, '');
            info.url = utils.getElementAttribute(titleSel, rowEl, 0, 'href');

            var nums = Utils.getNumbers(dataNode.text(), /\d+/g);
            info.comments = 0;
            info.readers = 0;
            if (nums.length === 2) {
                info.comments = nums[0];
                info.readers = nums[1];
            }
            info.author = $(authorSel, authorNode).text();
            info.authorUrl = Utils.getElementAttribute(authorSel, authorNode, 0, 'href');
            info.date = utils.getElementAttribute('span', authorNode, 0, 'innerText');
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

    if (page.pageLayer === 0) {
        page.boardPageNumber = 1; // it should be;
        page.pageType = 'board';
    }

    if (page.pageType === 'board') {
        parseTopicsOfBoard();
        parseNavOfBoard();
        chrombot.finishHtml();
    } else {
        chrombot.finishHtml();
    }

});