/// <reference path="../types/hm_jsmode_strict.d.ts" />
hidemaruGlobal.showbrowserpane(2);
hidemaruGlobal.setbrowserpaneurl(filename2(), 2);
var timerHandle = 0; // 時間を跨いで共通利用するので、varで
function heavyTick() {
    if (isTextUpdated() || isCountUpdated()) {
        hidemaru.postExecMacroMemory("jsmode @\"WebView2HmBrowserAutoUpdaterPost\"; js {refreshbrowserpane(2);}");
        console.log("dif");
    }
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
heavyTick();
createIntervalTick(heavyTick);
