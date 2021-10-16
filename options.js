"use strict";

function arrangePatternList(selector) {
    return $(selector).value
        .split("\n")
        .map(s => s.trim())
        .filter(p => URLMatchPattern.test(p))
    ;
}

function setResult(text = "") {
    $("#testResult").textContent = text;
}

$("#saveButton").disabled = true;

getData({blocklist: "", whitelist: ""})
.then(storage => {
    $("#blocklist").value = storage.blocklist;
    $("#whitelist").value = storage.whitelist;
});

$("#blocklist").addEventListener("input", () => {
    $("#saveButton").disabled = false;
    $("#testContainer").style.display = "none";
});

$("#whitelist").addEventListener("input", () => {
    $("#saveButton").disabled = false;
    $("#testContainer").style.display = "none";
});

$("#saveButton").addEventListener("click", () => {
    $("#blocklist").disabled = true;
    $("#whitelist").disabled = true;
    $("#saveButton").disabled = true;

    $("#blocklist").value = arrangePatternList("#blocklist").join("\n");
    $("#whitelist").value = arrangePatternList("#whitelist").join("\n");

    setData({
        blocklist: $("#blocklist").value,
        whitelist: $("#whitelist").value
    })
    .then(() => {
        $("#blocklist").disabled = false;
        $("#whitelist").disabled = false;
        urlTest();
        $("#testContainer").style.display = "";
        proxy.runtime.sendMessage("targetListUpdated");
    });
});

$("#testInput").addEventListener("input", urlTest);

function urlTest() {
    let result;
    let url = $("#testInput").value.trim();

    if(!url) return setResult();

    try      { url = new URL(url); }
    catch(e) { return setResult("invalid url"); }

    arrangePatternList("#blocklist").some(pattern => {
        if(!URLMatchPattern.test(pattern, url)) return false;
        result = "blocked by " + pattern;
        return true;
    });
    if(!result) return setResult("not blocked");

    arrangePatternList("#whitelist").some(pattern => {
        if(!URLMatchPattern.test(pattern, url)) return false;
        result = "allowed by " + pattern;
        return true;
    });
    setResult(result);
}
