chrome.tabs.onRemoved.addListener(function(tabId, obj) {
  pagesManager.removePage(tabId);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type === 'startTask') {
      neteaseBot.taskBegin();
      pagesManager.addPage({
        url: request.url,
        pageIndex: 0,
      });
    } else if (request.type === 'startHtml') {
      var pageInfo = pagesManager.getPageInfo(sender.tab.id);
      if (pageInfo) {
        sendResponse(pageInfo);
      }
    } else if(request.type === 'finishHtml') {
      neteaseBot.taskEnd();
      pagesManager.finishHtml(sender.tab.id);
    }
  }
);

(function coreMain() {
  rpc.init();
}());