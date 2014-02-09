chrome.tabs.onRemoved.addListener(function(tabId, obj){
    pagesManager.removePage(tabId);
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'startHtml') {
            var pageInfo = pagesManager.getPageInfo(sender.tab.id);
            if(pageInfo){
                sendResponse(pageInfo);
            }
        }
    }
);
