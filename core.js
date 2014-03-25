chrome.tabs.onRemoved.addListener(function(tabId, obj) {
  pagesManager.removePage(tabId);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type === 'startTask') {
      window.CoreRobot = new Basebot();
      if (request.taskType === 'neteaseMusic') {
        CoreRobot = new NeteaseBot(request.taskType);
        //[temp]
        CoreRobot.taskBegin();
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
      pagesManager.deactivePage(sender.tab.id);
      chrombot.getNewHtml({
        tabId: sender.tab.id,
        number: 1,
        notClosePage: true
      });
    } else if (request.type === 'addHtml') {
      utils.putLog(request);
      chrombot.addHtml(request);
    } else if (request.type === 'putLog'){
      utils.putLog(request.text, request.level, request.read);
    }
  }
);

(function coreMain() {
  rpc.init();
}());