/// <reference path="../types/hm_jsmode_strict.d.ts" />
hidemaruGlobal.showbrowserpane(1, 2);
hidemaruGlobal.setbrowserpaneurl(hidemaru.getFileFullPath(), 2);
var timerHandle = 0; // 時間を跨いで共通利用するので、varで
hidemaruGlobal.debuginfo(2);
function updateMethod() {
    if (!hidemaru.isMacroExecuting) {
        return;
    }
    if (isFileNameChanged()) {
        // console.log("isFileNameChanged\r\n")
        try {
            if (hidemaru.getFileFullPath() == "") {
                hidemaru.postExecMacroMemory("setbrowserpaneurl \"about:blank\", 2;");
            }
            else {
                hidemaru.postExecMacroMemory("setbrowserpaneurl filename2, 2;");
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    else if (isCountUpdated()) {
        //  console.log("isCountUpdated\r\n")
        if (isFileUpdated()) {
            // console.log("isFileUpdated\r\n")
            try {
                hidemaru.postExecMacroMemory("jsmode @\"WebView2HmBrowserAutoUpdaterMain\"; js {refreshbrowserpane(2);}");
                // let maxY = document.documentElement.scrollHeight - document.documentElement.clientHeight; window.scrollTo(0,50);
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    else if (true) {
        var _a = getChangeYPos(), diff = _a[0], posY = _a[1], allLineCount = _a[2];
        if (diff) {
            var perY = posY / allLineCount;
            try {
                hidemaru.postExecMacroMemory("jsmode @\"WebView2HmBrowserAutoUpdaterMain\"; js {setbrowserpaneurl(\"javascript:window.scrollTo(0, parseInt(".concat(perY, "*(document.documentElement.scrollHeight - document.documentElement.clientHeight)));\", 2)}"));
                // let maxY = document.documentElement.scrollHeight - document.documentElement.clientHeight; window.scrollTo(0,50);
            }
            catch (e) {
                console.log(e);
            }
        }
    }
}
var lastPosY = 0;
var lastAllLineCount = 0;
function getChangeYPos() {
    var diff = false;
    var posY = getCurCursorYPos();
    var allLineCount = getAllLineCount();
    if (lastPosY != posY) {
        diff = true;
    }
    if (lastAllLineCount != allLineCount) {
        diff = true;
    }
    return [diff, posY, allLineCount];
}
var lastFileName = "";
function isFileNameChanged() {
    var diff = false;
    var curFileName = hidemaru.getFileFullPath();
    if (curFileName != lastFileName) {
        diff = true;
    }
    lastFileName = curFileName;
    return diff;
}
var lastFileModified = 0;
function isFileUpdated() {
    var diff = false;
    var filepath = hidemaru.getFileFullPath();
    if (filepath != "") {
        var fso = hidemaru.createObject("Scripting.FileSystemObject");
        var f = fso.GetFile(filepath);
        var m = f.DateLastModified;
        if (m != lastFileModified) {
            diff = true;
            lastFileModified = m;
        }
    }
    return diff;
}
var updateCount = 0;
function isCountUpdated() {
    var curCount = hidemaru.getUpdateCount();
    if (updateCount != curCount) {
        updateCount = curCount;
        return true;
    }
    return false;
}
var preText = ""; // 時間を跨いで共通利用するので、varで
function isTextUpdated() {
    var curText = hidemaru.getTotalText();
    if (curText != undefined && preText != curText) {
        preText = curText;
        return true;
    }
    return false;
}
function stopIntervalTick() {
    if (timerHandle != 0) {
        createIntervalTick(timerHandle);
    }
}
function createIntervalTick(func) {
    stopIntervalTick();
    timerHandle = setInterval(func, 1000);
    return timerHandle;
}
function getAllLineCount() {
    var text = hidemaru.getTotalText();
    var cnt = text.match(/\n/g);
    return cnt.length + 1;
}
function getCurCursorYPos() {
    var pos = hidemaru.getCursorPos("wcs");
    console.log("curY:" + pos[0]);
    return pos[0];
}
updateMethod();
createIntervalTick(updateMethod);
