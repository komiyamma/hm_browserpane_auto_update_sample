/// <reference path="../types/hm_jsmode_strict.d.ts" />

hidemaruGlobal.showbrowserpane(1, 2);
hidemaruGlobal.setbrowserpaneurl(hidemaru.getFileFullPath(), 2);

var timerHandle: number = 0; // 時間を跨いで共通利用するので、varで

hidemaruGlobal.debuginfo(2);
function updateMethod() {
    if (isTextUpdated() /* || isCountUpdated()*/) {
        if (isFileUpdated()) {
            console.log("fileUpdated\r\n")
            try {
                hidemaru.postExecMacroMemory(`jsmode @"WebView2\HmBrowserAutoUpdaterPost"; js {refreshbrowserpane(2);}`);
            } catch (e) {
                console.log(e);
            }
        }
    }
}

var lastFileModified = 0;
function isFileUpdated(): boolean {
    let diff: boolean = false;
    let fso = hidemaru.createObject("Scripting.FileSystemObject");
    let f = fso.GetFile(hidemaru.getFileFullPath());
    let m = f.DateLastModified;
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

var preText: string = ""; // 時間を跨いで共通利用するので、varで
function isTextUpdated(): boolean {
    let curText: string = hidemaru.getTotalText();
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

function createIntervalTick(func): number {
    stopIntervalTick();
    timerHandle = setInterval(func, 1000);
    return timerHandle;
}

function getAllLineCount() {
    let text = hidemaru.getTotalText();
    let cnt = text.match(/\n/g);
    console.log("\\n:" + cnt.length);
}

function getCurCursorYPos() {
    let pos = hidemaru.getCursorPos("wcs");
    console.log("curY:"+pos[0]);
    return pos[0];
}
getAllLineCount();
getCurCursorYPos();
/*
updateMethod();
createIntervalTick(updateMethod);
*/