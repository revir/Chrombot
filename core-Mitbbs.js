function MitbbsBot(botType) {
    MitbbsBot.superClass.constructor.apply(this, arguments);
    MitbbsBot.__articles = [];
    MitbbsBot.__savedir = '';
}

Utils.extend(MitbbsBot, Basebot);

MitbbsBot.prototype.taskBegin = function() {
    chrome.runtime.onMessage.addListener(this._listener);
};
MitbbsBot.prototype.taskEnd = function() {
    chrome.runtime.onMessage.removeListener(this._listener);
    MitbbsBot.prototype._writeArticles();
};

MitbbsBot.prototype._writeArticles = function(){
    if(!MitbbsBot.__articles.length || !MitbbsBot.__savedir){
        return false;
    }
    utils.putLog('writeArticles...', 0);
    chrombot.writeJSON({
        savename: MitbbsBot.__articles[0].date+'.txt',
        savedir: MitbbsBot.__savedir,
        data: MitbbsBot.__articles
    });
    MitbbsBot.__articles = [];
};

MitbbsBot.prototype._listener = function(request, sender, sendResponse) {
    if (request.type === 'setArticle') {
        MitbbsBot.__articles.push(request.articleInfo);
        MitbbsBot.__savedir = request.savedir;

        if (request.articlesPerFile > 0 && MitbbsBot.__articles.length >= request.articlesPerFile) {
            MitbbsBot.prototype._writeArticles();
        }
    }
};