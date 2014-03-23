chrome.tabs.onRemoved.addListener(function(tabId, obj) {
  pagesManager.removePage(tabId);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var bot = null;
    if (request.type === 'startTask') {
      if (request.taskType === 'neteaseMusic') {
        bot = new NeteaseBot(request.taskType);
        //[temp]
        bot.taskBegin();
      }
      
      pagesManager.addPage({
        url: request.url,
        pageLayer: 0
      });
    } else if (request.type === 'startHtml') {
      var pageInfo = pagesManager.getPageInfo(sender.tab.id);
      if (pageInfo) {
        sendResponse(pageInfo);
      }
    } else if (request.type === 'finishHtml') {
      chrombot.getNewHtml({
        tabId: sender.tab.id,
        number: 1,
        notClosePage: true
      });
    } else if (request.type === 'addHtml') {
      utils.putLog(request);
      chrombot.addHtml(request);
    }
  }
);

(function coreMain() {
  rpc.init();
}());