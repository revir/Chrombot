chrome.tabs.onRemoved.addListener(function(tabId, obj) {
  pagesManager.removePage(tabId);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var bot = null;
    if (request.type === 'startTask') {
      if (request.taskType === 'neteaseMusic') {
        bot = new NeteaseBot(request.taskType);
      }
      //[temp]
      bot.taskBegin();
      pagesManager.addPage({
        url: request.url,
        pageIndex: 0,
      });
    } else if (request.type === 'startHtml') {
      var pageInfo = pagesManager.getPageInfo(sender.tab.id);
      if (pageInfo) {
        sendResponse(pageInfo);
      }
    } else if (request.type === 'finishHtml') {
      chrombot.getNewHtml({
        tabId: sender.tab.id,
        number: 1
      });
    } else if (request.type === 'addHtml') {
      chrombot.addHtml(request);
    } else if (request.type === 'endTask') {
      bot.taskEnd();
    }
  }
);

(function coreMain() {
  rpc.init();
}());