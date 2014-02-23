var pagesManager = {};
pagesManager.activePages = [];
pagesManager.addPage = function(data){
    if(!data.url)
        return false;
    chrome.tabs.create({url: data.url}, function (tab){
        pagesManager.activePages.push({
            tabId: tab.id,
            data: data
        });
    });
};
pagesManager.removePage = function(tabId){
    var filters = jQuery.grep(pagesManager.activePages, function(el){
        return el.tabId !== tabId;
    });
    pagesManager.activePages = filters;
};

pagesManager.getPageInfo = function(tabId){
    var data = null;
    jQuery.each(pagesManager.activePages, function(i, page){
        if(page.tabId === tabId){
            data = page.data;
            return false;
        }
    });
    return data;
};

pagesManager.finishHtml = function(tabId){
    
};