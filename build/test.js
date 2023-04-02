/// <reference path="../types/hm_jsmode_strict.d.ts" />
hidemaruGlobal.showbrowserpane(1, 2);
hidemaruGlobal.setbrowserpaneurl(hidemaru.getFileFullPath(), 2);
var timerHandle = 0; // 時間を跨いで共通利用するので、varで
hidemaruGlobal.debuginfo(2);
function updateMethod() {
    if (isFileNameChanged()) {
        try {
            hidemaru.postExecMacroMemory("setbrowserpaneurl filename2, 2;");
        }
        catch (e) {
            console.log(e);
        }
    }
    else if (isTextUpdated() /* || isCountUpdated()*/) {
        if (isFileUpdated()) {
            console.log("fileUpdated\r\n");
            try {
                hidemaru.postExecMacroMemory("jsmode @\"WebView2HmBrowserAutoUpdaterPost\"; js {refreshbrowserpane(2);}");
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    console.log(hidemaru.getFileFullPath());
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
    var fso = hidemaru.createObject("Scripting.FileSystemObject");
    var f = fso.GetFile(hidemaru.getFileFullPath());
    var m = f.DateLastModified;
    if (m != lastFileModified) {
        diff = true;
        lastFileModified = m;
    }
    return diff;
}
/*
var updateCount: number = 0;
function isCountUpdated(): boolean {
    let curCount: number = hidemaru.getUpdateCount();
    if (updateCount != curCount) {
        updateCount = curCount;
        return true;
    }
    return false;
}
*/
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
    console.log("\\n:" + cnt.length);
}
function getCurCursorYPos() {
    var pos = hidemaru.getCursorPos("wcs");
    console.log("curY:" + pos[0]);
    return pos[0];
}
updateMethod();
createIntervalTick(updateMethod);
