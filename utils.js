// Utils 公共函数

//Utils命名空间中的函数可以在页面脚本中调用
Utils = {};
utils = Utils;

Utils.sendMsg = function(type, datas, callback){
    var msg = jQuery.extend(true, {type: type}, datas || {});
    chrome.runtime.sendMessage(msg, callback);
};

Utils.putLog = function(text, level, read){
    var logfuns = [console.log, console.info, console.warn, console.error];
    level = level && (level < 4) ? level : 1;
    if(typeof(text) !== 'string')
        text = JSON.stringify(text);
    logfuns[level].call(console, text);
};

/* Extend function 模拟面向对象的类继承 */
Utils.extend = function(subClass, superClass) {
    var F = function() {};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;

    subClass.superClass = superClass.prototype;
    if (superClass.prototype.constructor == Object.prototype.constructor) {
        superClass.prototype.constructor = superClass;
    }
};

//通过浏览器内置的dom解析器，将相对url转换为绝对url
Utils.getAbsURL = function(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.href;
};

//打印错误信息并关闭页面
Utils.failAndClose = function(text) {
    Utils.putLog(text, 4);
    safesite.finishPage({
        discard: true
    });
};

//打印错误信息和重试次数， 然后重新加载页面，再关闭页面。

Utils.failAndRetry = function(text, page, retryTime) {
    var pageData = page.data.length ? JSON.parse(page.data) : {};
    var link = location.href;
    var times = retryTime || 3;
    pageData.retry = pageData.retry ? pageData.retry + 1 : 1;

    if (pageData.retry > times) {
        failAndClose(text + '...已重试' + times + '次！');
        return;
    }

    Utils.putLog(text + '...重试第' + pageData.retry + '次...');
    safesite.addPage({
        url: link,
        force: true,
        front: true,
        priority: 'high',
        savedir: page.savedir,
        savename: page.savename,
        data: JSON.stringify(pageData)
    });
    safesite.finishPage({
        discard: true
    });
};

//将 json 数据写入 csv 文件。 见 forum 模板的应用。
Utils.writeJsonToCsv = function(file, data, firstTime) {
    var line = '';
    if (typeof(data) === 'string') {
        line = data;
    } else if (typeof(data) === 'object') {
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                var text = String(data[i]).replace(/[,\r\n]/g, ' ');
                line += text + ',';
            }
        }
    }

    if (!line)
        return false;

    line = line.replace(/,$/, '\n');
    if (line.charAt(line.length - 1) !== '\n')
        line += '\n';

    if (firstTime) {
        Utils.putLog('创建文件：' + file, 0);
        safesite.fopen({
            path: file,
            mode: 'a',
            header: line
        });
    } else {
        safesite.fwrite({
            path: file,
            text: line
        });
    }
    return true;
};

//获取文本中的数字；
//参数 obj 可以是字符串， 也可以是 html或$对象
//regex可以指定，也可以不指定
//返回值是一个数字数组。如果没找到正则表达式的内容， 则返回空数组。

Utils.getNumbers = function(obj, regex) {
    var text = obj;
    if (typeof(obj) === 'object') {
        text = $(obj).text();
    }
    regex = regex || /\d+/;
    var m = text.match(regex);
    if (m) {
        return m.map(function(e) {
            var n = parseInt(e, 10);
            return n || 0;
        });
    } else {
        return [];
    }
};

//getNumbers的简单形式， 不接受正则表达式参数， 返回数字。

Utils.getNumber = function(obj) {
    var res = Utils.getNumbers(obj);
    return res.length ? res[0] : 0;
};

//对指定DOM元素的鼠标事件
//element是指要操作的元素
//action指定要模拟的事件，可以为"Click","RightClick",
// "LeftDown","LeftUp","RightDown","RightUp"

Utils.elementMouseEvent = function(element, action) {
    var rc = element.getBoundingClientRect();
    var scroll_pos = rc.bottom - rc.height;
    if (scroll_pos > $(document).height())
        scroll_pos = $(document).height();

    Utils.putLog('Scroll to ' + scroll_pos, 0);
    $("html, body").scrollTop(scroll_pos);

    rc = element.getBoundingClientRect();
    var X = rc.left + rc.width / 2;
    var Y = rc.bottom - rc.height / 2;

    Utils.putLog(action + ' at ' + X + ' x ' + Y, 0);
    safesite.mouseEvent({
        action: action,
        x: parseInt(X, 10),
        y: parseInt(Y, 10)
    });
};

//使用 jQuery 获取某个元素
//context:指定查找范围，其必须是有效的元素
//如果不指定范围，可以设置为0或''
//selector:指定要查找的元素
//position: 可以为数字或者是 "first" 或 "last", 默认为 0。
// 返回值为 dom 对象，如果没有获取到则返回 null
Utils.getElement = function(selector, context, position) {
    context = context || document;
    position = position || 0;
    var nodes = jQuery(selector, context);
    if (!nodes.length)
        return null;
    else {
        if (position === 'first')
            return nodes[0];
        else if (position === 'last')
            return nodes.last()[0];
        else if (typeof(position) === 'number')
            return position >= nodes.length ? null : nodes[position];
        else
            return null;
    }
};

//安全地获取元素的属性值
//context:指定查找范围
//selector:指定要查找的元素
//position: 可以为数字或者是 "first" 或 "last", 默认为 0。
//attribute: 属性名称， 先尝试获取 dom 元素的属性， 如没有则尝试 jQuery.attr() 函数;
//defaultValue: 默认返回值， 如果属性为空则返回该默认值。
//返回值是一个代表属性的字符串。

Utils.getElementAttribute = function (selector, context, position, attribute, defaultValue) {
    defaultValue = defaultValue || '';
    attribute = attribute || 'innerText';

    var element = Utils.getElement(selector, context, position);
    if (!element) {
        return '';
    } else if (element.hasOwnProperty(attribute)) {
        return element[attribute] || defaultValue;
    } else {
        return jQuery(element).attr(attribute) || defaultValue;
    }
};

//转义写入CSV文件中的特殊字符
//实际将出现的英文逗号转换为中文的逗号

Utils.escapeCSV = function(text) {
    if (typeof(text) != 'string')
        return '';

    return text.replace(/,/g, '，');
};

//将文件名中的路径分隔符转义

Utils.escapePath = function(text) {
    if (typeof(text) != 'string')
        return '';

    text = text.replace(/\\/g, ' ');
    return text.replace(/\//g, ' ');
};

//延时回调
//timeout为超时的毫秒数

Utils.delayedExecute = function(timeout, callback) {
    var interval = 100;

    function delay() {
        timeout -= interval;
        if (timeout <= 0) {
            window.clearInterval(id);
            callback();
        }
    }

    var id = window.setInterval(delay, interval);
};

//解析日期时间
//支持如下记法：
// * 2010-11-27 [00:05] (ISO标准时间格式)
// * 05-18 [18:25] (日期无年份)
// * 11:31[:34] (仅时间，日期为今日)
// * 39秒钟前/2 分钟前/5小时前/7 天前 (中文相对时间)
// * 今天 18:50 / 9月3日 [上午]20:24
// * 2013年10月1日 [10时9分38秒]
// 注：以上记法中'-'和'/'是相等的
//返回值为标准的Date对象

Utils.parseDateTime = function(str) {
    var current = new Date();
    var invalid = new Date(NaN);
    var matches = [];
    var offset = 0,
        unit = 0,
        offset_seconds = 0,
        yesterday = 0;

    if (typeof(str) != "string")
        return invalid;

    str = str.replace(/\s/g, ' ');
    str = str.trim();

    //首先用标准的Date.parse()函数来尝试解析字符串，
    //但是对于"05-18 [18:25]"这种无年份的简写情况，
    //可以解析成功但得到的年份不对，因此需要首先处理这种特殊情况
    if (/^\d{1,2}(\/|-|\.)\d{1,2}(\ |$)/.test(str)) {
        str = String(current.getFullYear()) + '-' + str;
    }

    //尝试使用标准ISO格式解析字符串
    var parsed = Date.parse(str);
    if (!isNaN(parsed)) {
        return new Date(parsed);
    }

    //判断是否是仅时间记法，即'11:31'或'11:31:23'
    if (/^\d{1,2}:\d{1,2}(:\d{1,2}|)/.test(str)) {
        matches = (str).match(/^(\d{1,2}):(\d{1,2})(:|)(\d{1,2}|)/);
        current.setHours(matches[1]);
        current.setMinutes(matches[2]);
        if (matches[4].length)
            current.setSeconds(matches[4]);

        return current;
    }

    //判断是否是中文相对时间记法
    if (str.indexOf('前') != -1 &&
        str.indexOf('前天') == -1) {
        //移除空格
        str = str.replace(/\s/g, '');

        //得到偏移值和时间单位
        if (str.indexOf('半') != -1) {
            matches = str.match(/半(\S+)前/);
            if (matches !== null) {
                offset = 0.5;
                unit = matches[1];
            } else
                return invalid;
        } else {
            matches = str.match(/(\d+)(\S+)前/);
            if (matches !== null) {
                offset = matches[1];
                unit = matches[2];
            } else
                return invalid;
        }

        if (unit == '秒' || unit == '秒钟') {
            offset_seconds = offset;
        } else if (unit == '分' || unit == '分钟') {
            offset_seconds = offset * 60;
        } else if (unit == '时' || unit == '小时') {
            offset_seconds = offset * 60 * 60;
        } else if (unit == '日' || unit == '天') {
            offset_seconds = offset * 60 * 60 * 24;
        } else if (unit == '月' || unit == '个月') {
            offset_seconds = offset * 60 * 60 * 24 * 30;
        } else if (unit == '年') {
            offset_seconds = offset * 60 * 60 * 24 * 30 * 12;
        } else {
            //Utils.putLog('无效的时间单位', 3);
            return invalid;
        }

        return new Date(current.getTime() - offset_seconds * 1000);
    }

    //中文格式如：
    //今天 18:50
    //9月3日 [上午]20:24
    //2013年10月1日 [10时9分38秒]
    if (str.indexOf('今天') != -1) {
        str = str.replace('今天', current.toDateString() + ' ');
    } else if (str.indexOf('昨天') != -1) {
        yesterday = new Date(current.getTime() - 60 * 60 * 24 * 1000);
        str = str.replace('昨天', yesterday.toDateString() + ' ');
    } else if (str.indexOf('前天') != -1) {
        yesterday = new Date(current.getTime() - 60 * 60 * 24 * 2 * 1000);
        str = str.replace('前天', yesterday.toDateString() + ' ');
    }

    if (str.indexOf('年') != -1) {
        str = str.replace('年', '-');
    }
    if (str.indexOf('月') != -1) {
        str = str.replace('月', '-');
    }
    if (str.indexOf('日') != -1) {
        str = str.replace('日', ' ');
    }
    if (str.indexOf('时') != -1) {
        str = str.replace('时', ':');
    }
    if (str.indexOf('分') != -1) {
        if (str.indexOf('秒') != -1)
            str = str.replace('分', ':');
        else
            str = str.replace('分', ' ');
    }
    if (str.indexOf('秒') != -1) {
        str = str.replace('秒', ' ');
    }
    if (str.indexOf('上午') != -1) {
        str = str.replace('上午', ' ');
        str += ' am';
    }
    if (str.indexOf('下午') != -1) {
        str = str.replace('下午', ' ');
        str += ' pm';
    }

    //转换为英文后再试
    parsed = Date.parse(str);
    if (!isNaN(parsed)) {
        return new Date(parsed);
    }

    return invalid;
};

Utils.withinDaysInternal = function(date, n) {
    if (isNaN(date.getTime()))
        return false;

    var current = new Date();
    if (date.getTime() > current.getTime())
        return false;

    if (current.getTime() - date.getTime() <
        1000 * 60 * 60 * 24 * n)
        return true;

    return false;
};

//指定日期时间是否是最近一天内

Utils.withinDay = function(time_str) {
    return Utils.withinDaysInternal(Utils.parseDateTime(time_str), 1);
};

//指定日期时间是否是最近一周内

Utils.withinWeek = function(time_str) {
    return Utils.withinDaysInternal(Utils.parseDateTime(time_str), 7);
};

//指定日期时间是否是最近一月内

Utils.withinMonth = function(time_str) {
    return Utils.withinDaysInternal(Utils.parseDateTime(time_str), 30);
};

//指定日期时间是否是最近一年内

Utils.withinYear = function(time_str) {
    return Utils.withinDaysInternal(Utils.parseDateTime(time_str), 365);
};

//截取frame中的窗口时可能需要滚动， 则滚动一屏截取一张图片， 直到截取到底端为止。
Utils.snapShotFrame = function(frameSelector, maindoc, savename, savedir, onFinish) {
    maindoc = maindoc || document;
    var node = $(frameSelector, maindoc);

    var doc = $(frameSelector, maindoc)[0].contentDocument;

    (function ss(index) {
        index = index || 0;
        safesite.snapshot({
            savedir: savedir,
            savename: index ? savename + '_' + index : savename
        }, function(detail) {
            //bugfix, 此处每一次都要重新获取高度， 因为网页可能会改变。
            var winHeight = node.height(),
                docHeight = $(doc).height(),
                curScrollTop = $(doc).scrollTop();
            Utils.putLog('snapShotFrame: winHeight x docHeight x curScrollTop = ' + winHeight + ' x ' + docHeight + ' x ' + curScrollTop, 0);
            if (curScrollTop < docHeight - winHeight) {
                $(doc).scrollTop(curScrollTop + winHeight);
                delayedExecute(1000, ss(index + 1));
            } else {
                onFinish(detail);
            }
        });
    }());
};

//自动滚动到页面底端
//直到appear指定元素出现并且disappear元素消失
//如果appear或disappear 元素为空， 则只判断另一种元素
//timeout：超时时间（毫秒数），该函数精度为1毫秒
//回调函数参数：false表示超时

Utils.autoScroll = function(appear_selector, disappear_selector, process) {
    var interval = 600, //ms
        timeOut = 15000, //ms
        id = 0;

    var doScroll = function() {
        Utils.putLog('autoScroll...', 0);
        var appear = $(appear_selector);
        var disappear = $(disappear_selector);
        timeOut -= interval;
        if ($(document).height() - $(window).height() === $(document).scrollTop()) {
            if ((!appear_selector || appear.length) && (!disappear_selector || !disappear.length)) {
                $("html, body").scrollTop(0);
                window.clearInterval(id);
                process(true);
                return;
            }
        }
        if (timeOut < 0) {
            $("html, body").scrollTop(0);
            window.clearInterval(id);
            process(false);
            return;
        }
        $("html, body").scrollTop($(document).height());
    };

    $("html, body").scrollTop($(document).height());
    id = window.setInterval(doScroll, interval);
};

//往下滚动一屏， 然后回调处理， 直至末尾。
//process： 回调函数， 每滚动一屏时调用。 如果返回false, 则不再往下滚动。 
//例子见 Google+ 模板

Utils.scrollDown = function(process) {
    var interval = 1000,
        scrollCount = 0;
    (function _scrollDown() {
        scrollCount += 1;
        var cur_pos = $(document).scrollTop(),
            win_h = $(window).height();
        $(document).scrollTop(cur_pos + win_h);
        Utils.putLog('scrollDown...('+scrollCount+')', 0);

        delayedExecute(1200, function() {
            var cur_pos = $(document).scrollTop(),
                doc_h = $(document).height();
            if (cur_pos < doc_h - win_h) {
                if (process() !== false) {
                    _scrollDown();
                }
            } else {
                process(true);
            }

        });
    }());
};

//等待 comparefunc 完成后回调 process
//compareFunc 只有返回 true 才会继续执行 Process
Utils.waitCompare = function(compareFunc, process){
    var interval = 1000, //ms
        timeOut = 30000, //ms
        el = [];
    if(!compareFunc){
        process(true);
        return;
    }
    var doCompare = function(){
        Utils.putLog('waitCompare...', 0);
        timeOut -= interval;
        var res = compareFunc();
        if(res || timeOut<0){
            window.clearInterval(id);
            process(timeOut > 0);
        }
    };
    var id = window.setInterval(doCompare, interval);
};

//因为某些页面需要加载ajax, 所以用此方法来判断ajax是否已经加载完， 
//然后才处理页面。
//process的参数， 如果超时了为false， 否则true。

Utils.waitForAjax = function(selector, context, process) {
    var interval = 1000; //ms
    var timeOut = 10000; //ms
    var id = 0,
        el = [];
    var doPage = function() {
        Utils.putLog('waitForAjax...', 0);
        timeOut -= interval;
        el = $(selector, context);
        if (el.length >= 1 || timeOut <= 0) {
            window.clearInterval(id);
            process(timeOut > 0);
        }

    };

    id = window.setInterval(doPage, interval);
};

//如果ajax的内容用frame包含起来了，则用此函数等待frame中的内容加载
//然后才处理页面。
//frames可以是一个 frame 的选择器字符串，也可以为字符串数组， 代表多个frame依次包含。
//process的参数， 如果超时了为false， 否则true。

Utils.waitForAjaxInFrame = function(selector, frames, process) {
    var interval = 1000; //ms
    var timeOut = 10000; //ms
    var id = 0,
        el = [];
    var doPage = function() {
        Utils.putLog('waitForAjaxInFrame...', 0);
        timeOut -= interval;
        if (typeof(frames) === 'string') {
            frames = [frames];
        }
        var f = '';
        for (var i = 0; i < frames.length; i++) {
            f = $(frames[i], f);
            if (f.length > 0) {
                f = f[0].contentDocument;
            } else {
                f = '';
                Utils.putLog(frames[i], 0);
                break;
            }
        }
        if (f) {
            el = $(selector, f);
            if (el.length > 0) {
                window.clearInterval(id);
                process(true);
            }
        }
        if (timeOut <= 0) {
            window.clearInterval(id);
            process(false);
        }

    };

    id = window.setInterval(doPage, interval);
};

Utils.waitForChange = function(origin, selector, context, attrName, process) {
    //等待页面元素发生改变后调用process.
    //如果 origin 未定义， 则不等待直接调用process
    //process的参数， 如果超时则为false, 否则为true;
    var interval = 1000, //ms
        timeOut = 10000, //ms
        el = [];

    if (origin === undefined) {
        process(true);
        return;
    }

    var doCompare = function() {
        //Utils.putLog('waitForChange, origin: '+origin, 0);
        Utils.putLog('waitForChange...', 0);
        timeOut -= interval;
        el = $(selector, context);
        var present = el.attr(attrName);
        if ((el.length > 0 && origin != present) || timeOut <= 0) {
            window.clearInterval(id);
            process(timeOut > 0);
        }
    };

    var id = window.setInterval(doCompare, interval);
};

Utils.waitForTextChange = function(origin, selector, context, process) {
    //等待页面元素发生改变后调用process.
    //不同于上面的函数， 这里比较的是 元素的 text。
    //process的参数， 如果超时则为false, 否则为true;
    //如果 origin 未定义， 则不等待直接调用process
    var interval = 500, //ms
        timeOut = 10000, //ms
        el = [];

    if (origin === undefined) {
        process(true);
        return;
    }

    var doCompare = function() {
        // Utils.putLog('waitForTextChange——origin: '+origin, 0);
        Utils.putLog('waitForTextChange...', 0);
        timeOut -= interval;
        el = $(selector, context);
        var present = el.text();
        // Utils.putLog('waitForTextChange——present: '+present, 0);
        if ((el.length > 0 && origin != present) || timeOut <= 0) {
            window.clearInterval(id);
            process(timeOut > 0);
        }
    };

    var id = window.setInterval(doCompare, interval);
};

Utils.waitForTextChangeInFrame = function(origin, selector, frames, process) {
    //等待页面元素发生改变后调用process.
    //不同于上面的函数， 这里比较的是 元素的 text。
    //process的参数， 如果超时则为false, 否则为true;
    //如果 origin 未定义， 则不等待直接调用process
    var interval = 500, //ms
        timeOut = 15000; //ms

    if (origin === undefined) {
        process(true);
        return;
    }

    var doCompare = function() {
        // Utils.putLog('waitForTextChange——origin: '+origin, 0);
        Utils.putLog('waitForTextChangeInFrame...', 0);
        timeOut -= interval;
        if (typeof(frames) === 'string') {
            frames = [frames];
        }
        var f = '';
        for (var i = 0; i < frames.length; i++) {
            f = $(frames[i], f);
            if (f.length > 0) {
                f = f[0].contentDocument;
            } else {
                f = '';
                break;
            }
        }
        if (f) {
            var el = $(selector, f);
            var present = el.text();
            // Utils.putLog('waitForTextChange——present: '+present, 0);
            if (el.length > 0 && origin != present) {
                window.clearInterval(id);
                process(true);
                return;
            }
        }
        if (timeOut <= 0) {
            window.clearInterval(id);
            process(false);
            return;
        }

    };

    var id = window.setInterval(doCompare, interval);
};