var pagesManager = {};
pagesManager.activePages = {};
pagesManager.addPage = function(data) {
    if (!data.url)
        return false;
    chrome.tabs.create({
        url: data.url
    }, function(tab) {
        pagesManager.activePages[tab.id] = data;
    });
};

pagesManager.removePage = function(tabId){
    if(!tabId)
        return false;
    delete pagesManager.activePages[tabId];
    chrome.tabs.remove(tabId);
};

pagesManager.updatePage = function(data, tabId) {
    if (!data || !data.url) { //delete tab
        if(!data.notClosePage)
            pagesManager.removePage(tabId);
    } else {
        if (!tabId || !pagesManager.activePages[tabId]) { //create new tab
            pagesManager.addPage(data);
        } else { //update tab
            pagesManager.activePages[tabId] = data;
            chrome.tabs.update(tabId, {
                url: data.url
            });
        }
        // pagesManager.removePage(tabId);
        // pagesManager.addPage(data);
    }
};

pagesManager.getPageInfo = function(tabId) {
    return pagesManager.activePages[tabId];
};