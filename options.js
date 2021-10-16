"use strict";

/**
 * Variables
 */

const g = document.getElementById.bind(document);
const
    blocklistTA = g("blocklist"),
    whitelistTA = g("whitelist"),
    saveButton = g("saveButton"),
    testInput = g("testInput"),
    testContainer = g("testContainer")
;


/**
 * Main
 */

getData({blocklist: "", whitelist: ""})
.then(storage => {
    blocklistTA.value = storage.blocklist;
    whitelistTA.value = storage.whitelist;
    urlTest();
});

blocklistTA.addEventListener("input", () => {
    saveButton.disabled = false;
    testContainer.style.display = "none";
});

whitelistTA.addEventListener("input", () => {
    saveButton.disabled = false;
    testContainer.style.display = "none";
});

saveButton.disabled = true;
saveButton.addEventListener("click", () => {
    blocklistTA.disabled = true;
    whitelistTA.disabled = true;
    saveButton.disabled = true;

    setData({
        blocklist: blocklistTA.value = arrangePatternList(blocklistTA).join("\n"),
        whitelist: whitelistTA.value = arrangePatternList(whitelistTA).join("\n")
    })
    .then(() => {
        proxy.runtime.sendMessage("targetListUpdated");
        blocklistTA.disabled = false;
        whitelistTA.disabled = false;
        urlTest();
        testContainer.style.display = "";
    });
});

testInput.addEventListener("input", urlTest);

const testURL = (new URL(document.location)).searchParams.get("testURL");
if(testURL) {
    testInput.value = testURL;
    testInput.focus();
}


/**
 * Functions
 */

function urlTest() {
    let result;
    let url = testInput.value.trim();

    if(!url) return setResult();

    try      { url = new URL(url); }
    catch(e) { return setResult("invalid url"); }

    arrangePatternList(blocklistTA).some(pattern => {
        if(!URLMatchPattern.test(pattern, url)) return false;
        result = "blocked by " + pattern;
        return true;
    });
    if(!result) return setResult("not blocked");

    arrangePatternList(blocklistTA).some(pattern => {
        if(!URLMatchPattern.test(pattern, url)) return false;
        result = "allowed by " + pattern;
        return true;
    });
    setResult(result);
}

function arrangePatternList(textarea) {
    return textarea.value
        .split("\n")
        .map(s => s.trim())
        .filter(p => URLMatchPattern.test(p))
    ;
}

function setResult(text = "") {
    g("testResult").textContent = text;
}
