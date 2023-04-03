/// <reference path="../types/hm_jsmode_strict.d.ts" />

hidemaruGlobal.showbrowserpane(1, 2);
hidemaruGlobal.setbrowserpaneurl(hidemaru.getFileFullPath(), 2);

var timerHandle: number = 0; // 時間を跨いで共通利用するので、varで

hidemaruGlobal.debuginfo(2);

function updateMethod() {
    if (!hidemaru.isMacroExecuting) {
        return;
    }

    if (isFileNameChanged()) {
        // console.log("isFileNameChanged\r\n")
        try {
            if (hidemaru.getFileFullPath() == "") {
                hidemaru.postExecMacroMemory(`setbrowserpaneurl "about:blank", 2;`); 
            } else {
                hidemaru.postExecMacroMemory(`setbrowserpaneurl filename2, 2;`);
            }
        } catch(e) {
            console.log(e);
        }
    }
    else if ( isCountUpdated() ) {
       //  console.log("isCountUpdated\r\n")
        if (isFileUpdated()) {
            // console.log("isFileUpdated\r\n")
            try {
                hidemaru.postExecMacroMemory(`jsmode @"WebView2\HmBrowserAutoUpdaterMain"; js {refreshbrowserpane(2);}`);
                // let maxY = document.documentElement.scrollHeight - document.documentElement.clientHeight; window.scrollTo(0,50);
            } catch (e) {
                console.log(e);
            }
        }
    }
    else if ( true ) {
        let [diff, posY, allLineCount] = getChangeYPos();
        if (allLineCount < 0) { allLineCount = 1;}
        if (diff && posY > 0 && allLineCount > 0) {
            if ( posY < 10) { // 最初の行まであと10行程度なのであれば、最初にいる扱いにする。
                posY = 0;
            }
            if ( allLineCount - posY < 15 ) {
                posY = allLineCount; // 最後の行まであと15行程度なのであれば、最後の行にいる扱いにする。
            }
            let perY: number = posY / allLineCount;
            if (perY > 1) {
                perY = 1;
            } else if (perY < 0) {
                perY = 0
            }
            try {
                hidemaru.postExecMacroMemory(`jsmode @"WebView2\HmBrowserAutoUpdaterMain"; js {setbrowserpaneurl("javascript:window.scrollTo(0, parseInt(${perY}*(document.documentElement.scrollHeight - document.documentElement.clientHeight)));", 2)}`);
            } catch (e) {
                console.log(e);
            }
        }
    }
}

var lastPosY = 0;
var lastAllLineCount = 0;
function getChangeYPos():[boolean, number, number] {
    let diff: boolean = false;
    let posY = getCurCursorYPos();
    let allLineCount = getAllLineCount();
    if (lastPosY != posY) {
        lastPosY = posY;
        diff = true;
    }
    if (lastAllLineCount != allLineCount) {
        lastAllLineCount = allLineCount;
        diff = true;
    }
    return [diff, posY, allLineCount];
}

var lastFileName: string = "";
function isFileNameChanged(): boolean {
    let diff: boolean = false;
    let curFileName = hidemaru.getFileFullPath();
    if (curFileName != lastFileName) {
        diff = true;
    }

    lastFileName = curFileName;
    return diff;
}

var lastFileModified: number = 0;
function isFileUpdated(): boolean {
    let diff: boolean = false;
    let filepath = hidemaru.getFileFullPath();
    if (filepath != "") {
        let fso: any = hidemaru.createObject("Scripting.FileSystemObject");
        let f = fso.GetFile(filepath);
        let m = f.DateLastModified;
        if (m != lastFileModified) {
            diff = true;
            lastFileModified = m;
        }
    }
    return diff;
}


var updateCount: number = 0;
function isCountUpdated(): boolean {
    let curCount: number = hidemaru.getUpdateCount();
    if (updateCount != curCount) {
        updateCount = curCount;
        return true;
    }
    return false;
}


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
    return cnt.length + 1;
}

function getCurCursorYPos() {
    let pos = hidemaru.getCursorPos("wcs");
    console.log("curY:"+pos[0]);
    return pos[0];
}

updateMethod();
createIntervalTick(updateMethod);
