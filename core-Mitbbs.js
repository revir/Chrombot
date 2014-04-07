function MitbbsBot(botType) {
    MitbbsBot.superClass.constructor.apply(this, arguments);
    MitbbsBot.__articles = [];

    // MitbbsBot.__savedir = '';
    MitbbsBot.__tooken = '';
    MitbbsBot.postArticleUrl = 'http://kooteq.com/new-thread/';
}

Utils.extend(MitbbsBot, Basebot);

MitbbsBot.prototype.taskBegin = function() {
    chrome.runtime.onMessage.addListener(this._listener);

    //open kooteq, get its cookie data;
    pagesManager.addPage({
        url: MitbbsBot.postArticleUrl,
        pageLayer: 0
    });
};
MitbbsBot.prototype.taskEnd = function() {
    chrome.runtime.onMessage.removeListener(this._listener);
    // MitbbsBot.prototype._writeArticles();
};

// MitbbsBot.prototype._writeArticles = function() {
//     if (!MitbbsBot.__articles.length || !MitbbsBot.__savedir) {
//         return false;
//     }
//     chrombot.putLog('writeArticles...', 0);
//     chrombot.writeJSON({
//         savename: MitbbsBot.__articles[0].date + '.txt',
//         savedir: MitbbsBot.__savedir,
//         data: MitbbsBot.__articles
//     });
//     MitbbsBot.__articles = [];
// };

MitbbsBot.prototype._listener = function(request, sender, sendResponse) {
    if (request.type === 'setArticle') {
        // MitbbsBot.__articles.push(request.articleInfo);
        // MitbbsBot.__savedir = request.savedir;
        var articleInfo = request.articleInfo;

        if (articleInfo.articleType === '文字') {
            chrombot.putLog('Get a 文字 article, title: ' + articleInfo.title + '  url: ' + articleInfo.url);
            MitbbsBot.prototype.postArticle(request.articleInfo);
        } else if (articleInfo.articleType === '图片') {
            chrombot.putLog('Get a 图片 article, title: ' + articleInfo.title + '  url: ' + articleInfo.url);
            chrombot.downloadItems(articleInfo);
        }

        // if (request.articlesPerFile > 0 && MitbbsBot.__articles.length >= request.articlesPerFile) {
        //     MitbbsBot.prototype._writeArticles();
        // }
    } else if (request.type === 'saveTooken') {
        MitbbsBot.__tooken = request.tooken;
        chrombot.putLog('Get the tooken of kooteq.com:  ' + MitbbsBot.__tooken);
    }
};

MitbbsBot.prototype.postArticle = function(articleInfo) {
    if (!MitbbsBot.__tooken) {
        chrombot.putLog('postArticle, but havenot get the tooken yet, push to the cache.', 2);
        MitbbsBot.__articles.push(articleInfo);
        return;
    }
    var formData = new FormData();
    formData.append('csrfmiddlewaretoken', MitbbsBot.__tooken);
    formData.append('title', articleInfo.title);
    formData.append('content', articleInfo.content);

    if (articleInfo.articleType === '文字') {
        formData.append('category', 1);
    } else if (articleInfo.articleType === '图片') {
        formData.append('category', 2);
    } else{
        chrombot.putLog('postArticle error!', 3);
        return;
    }
    jQuery.ajax({
        url: MitbbsBot.postArticleUrl,
        contentType: false,
        processData: false,
        data: formData,
        type: 'post'
    });
};

MitbbsBot.prototype.onDownloadItemsFinished = function(articleInfo) {
    var content = articleInfo.content;
    $.each(articleInfo.downloadItems, function(index, item) {
        if (item.saveurl) {
            var mdStr = '![' + item.savename + ']' + '(' + item.saveurl + ')';
            content += '\n' + mdStr;
            chrombot.putLog('onDownloadItemsFinished item: ' + mdStr, 0);
        }
    });
    articleInfo.content = content;
    // [temp]
    chrombot.putLog(articleInfo, 0);
    MitbbsBot.prototype.postArticle(articleInfo);
};