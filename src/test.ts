/// <reference path="../types/hm_jsmode_strict.d.ts" />

hidemaruGlobal.showbrowserpane(1, 2);
hidemaruGlobal.setbrowserpaneurl(hidemaru.getFileFullPath(), 2);

var timerHandle: number = 0; // 時間を跨いで共通利用するので、varで

hidemaruGlobal.debuginfo(2);

function updateMethod() {
    if (hidemaru.isMacroExecuting()) {
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
            if ( posY < 15) { // 最初の行まであと10行程度なのであれば、最初にいる扱いにする。
                posY = 0;
            }
            if ( allLineCount - posY < 15 ) {
                posY = allLineCount; // 最後の行まであと15行程度なのであれば、最後の行にいる扱いにする。
            }
            let perY: number = posY / allLineCount;
            if (perY >= 1) {
                perY = 1.1; // これ丁度だと最後の行が微妙な感じになりやすい。
            } else if (perY < 0) {
                perY = 0
            }
            // console.log("perY:"+perY);
            try {
                hidemaru.postExecMacroMemory(`jsmode @"WebView2\HmBrowserAutoUpdaterMain"; js {setbrowserpaneurl("javascript:window.scrollTo(0, parseInt(${perY}*(document.documentElement.scrollHeight - document.documentElement.clientHeight)));", 2)}`);
            } catch (e) {
                console.log(e);
            }
        }
    }
}

let lastPosY = 0;
let lastPosYArray: number[] = [3,2,1]; // 全部違う値で先頭付近でとりあえず埋めておく
let lastAllLineCount = 0;
function getChangeYPos():[boolean, number, number] {
    let diff: boolean = false;
    let posY = getCurCursorYPos();
    // console.log("posY:" + posY);
    let allLineCount = getAllLineCount();
    if (lastPosY != posY) {
        lastPosY = posY;
        diff = true;
    }
    lastPosYArray.push(posY);
    lastPosYArray.shift();
    console.log(lastPosYArray);
// ３つとも一緒(カーソルが動いていない) で マウスによる位置とかけ離れている時は、マウスによる位置を採用
    if (lastPosYArray[0] == lastPosYArray[1] && lastPosYArray[0] == lastPosYArray[2]) {
        let mousePosY = getCurCursorYPosFromMousePos();
        if (mousePosY > 1) {
            // console.log("カーソル動いていない");
            // console.log("posY:" + posY + "\r\n");
            // console.log("mousePosY:" + mousePosY + "\r\n");
            let abs = Math.abs(posY - mousePosY);
            if (abs >= 15) {
                // console.log("マウスの位置との差:"+ abs);
                posY = mousePosY;
                diff = true;
            }
        }
    } else {
        diff = true;
    }
    // console.log("poallLineCounts:" + allLineCount);
    if (lastAllLineCount != allLineCount) {
        lastAllLineCount = allLineCount;
        diff = true;
    }
    return [diff, posY, allLineCount];
}

let lastFileName: string = "";
function isFileNameChanged(): boolean {
    let diff: boolean = false;
    let curFileName = hidemaru.getFileFullPath();
    if (curFileName != lastFileName) {
        diff = true;
    }

    lastFileName = curFileName;
    return diff;
}

let lastFileModified: number = 0;
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


let updateCount: number = 0;
function isCountUpdated(): boolean {
    let curCount: number = hidemaru.getUpdateCount();
    if (updateCount != curCount) {
        updateCount = curCount;
        return true;
    }
    return false;
}


let preText: string = "";
function isTextUpdated(): boolean {
    let curText: string = hidemaru.getTotalText();
    if (curText != undefined && preText != curText) {
        preText = curText;
        return true;
    }

    return false;
}

function initVariable() {
    lastPosYArray = [3,2,1];
}
function stopIntervalTick() {
    if (timerHandle != 0) {
        clearInterval(timerHandle);
    }
}

function createIntervalTick(func): number {
    initVariable();
    stopIntervalTick();
    timerHandle = setInterval(func, 1000);
    return timerHandle;
}

function getAllLineCount() {
    let text = hidemaru.getTotalText();
    let cnt = text.match(/\n/g);
    return cnt.length;
}

function getCurCursorYPos() {
    let pos = hidemaru.getCursorPos("wcs");
    return pos[0];
}

function getCurCursorYPosFromMousePos() {
    let pos = hidemaru.getCursorPosFromMousePos("wcs");
    return pos[0];
}

updateMethod();
createIntervalTick(updateMethod);

