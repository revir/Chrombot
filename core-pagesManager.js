var pagesManager = {};
pagesManager.activePages = {};
pagesManager.deactivePages = {};
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
    if(pagesManager.activePages.hasOwnProperty(tabId))
        delete pagesManager.activePages[tabId];
    else if(pagesManager.deactivePages.hasOwnProperty(tabId))
        delete pagesManager.deactivePages[tabId];
    else
        return false;

    chrome.tabs.remove(tabId);
};

pagesManager.removeAll = function(){
    for (var tabId in pagesManager.activePages){
        chrome.tabs.remove(parseInt(tabId, 10));
    }
    for (tabId in pagesManager.deactivePages){
        chrome.tabs.remove(parseInt(tabId, 10));
    }
    pagesManager.activePages = {};
    pagesManager.deactivePages = {};
};

pagesManager.deactivePage = function(tabId){
    if(!tabId || ! pagesManager.activePages.hasOwnProperty(tabId))
        return false;
    var data = pagesManager.activePages[tabId];
    pagesManager.deactivePages[tabId] = data;

    delete pagesManager.activePages[tabId];
};

pagesManager.updatePage = function(data, tabId) {
    if (!tabId) { //create new tab
        pagesManager.addPage(data);
    } else if (pagesManager.deactivePages.hasOwnProperty(tabId)){
        delete pagesManager.deactivePages[tabId];
        pagesManager.activePages[tabId] = data;
        chrome.tabs.update(tabId, {
            url: data.url
        });
    } else {
        Utils.putLog('###UpdatePage error: the updating tabId is not in deactivePages!', 3);
        return false;
    }
};

pagesManager.getPageInfo = function(tabId) {
    if(!tabId)
        return false;
    if(pagesManager.activePages.hasOwnProperty(tabId))
        return pagesManager.activePages[tabId];
    else if(pagesManager.deactivePages.hasOwnProperty(tabId))
        return pagesManager.deactivePages[tabId];
    else
        return false;
};

pagesManager.getPagesCount = function(){
    return Object.keys(pagesManager.activePages).length + Object.keys(pagesManager.deactivePages).length;
};

pagesManager.hasNoActivePages = function(){
    return ! Object.keys(pagesManager.activePages).length;
};