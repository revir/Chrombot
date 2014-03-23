chrombot.startHtml(function(page) {
    if(page.pageIndex === 0){
        var sceneries = jQuery('div.info a.property_title');
        chrombot.putLog('Get '+sceneries.length+ ' sceneries.');
        sceneries.each(function(index, scenery){
            chrombot.addHtml({
                url: scenery.href
            });
        });
    }
});