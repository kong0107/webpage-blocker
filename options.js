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

blocklistTA.addEventListener("input", onChange);
whitelistTA.addEventListener("input", onChange);

saveButton.disabled = true;
saveButton.addEventListener("click", () => {
    blocklistTA.disabled = true;
    whitelistTA.disabled = true;
    saveButton.disabled = true;
    saveButton.textContent = "Saving";

    setData({
        blocklist: blocklistTA.value = arrangePatternList(blocklistTA).join("\n"),
        whitelist: whitelistTA.value = arrangePatternList(whitelistTA).join("\n")
    })
    .then(() => {
        proxy.runtime.sendMessage("targetListUpdated");
        blocklistTA.disabled = false;
        whitelistTA.disabled = false;
        saveButton.textContent = "Saved";
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

function onChange() {
    saveButton.disabled = false;
    saveButton.textContent = "Save";
    testContainer.style.display = "none";
}

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

    arrangePatternList(whitelistTA).some(pattern => {
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
