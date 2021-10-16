"use strict";

function arrangePatternList(str) {
    return str
        .split("\n")
        .map(s => s.trim())
        .filter(p => URLMatchPattern.test(p))
        .join("\n")
    ;
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

    $("#blocklist").value = arrangePatternList($("#blocklist").value);
    $("#whitelist").value = arrangePatternList($("#whitelist").value);

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
    let url, result;
    try {
        url = new URL($("#testInput").value);
    }
    catch(e) {
        $("#testResult").textContent = "invalid url";
        return;
    }

    const blocklist = $("#blocklist").value;
    if(!blocklist) {
        $("#testResult").textContent = "no blocklist";
        return;
    }

    blocklist.split("\n").some(pattern => {
        if(!URLMatchPattern.test(pattern, url)) return false;
        result = "blocked by " + pattern;
        return true;
    });
    if(!result) {
        $("#testResult").textContent = "not blocked";
        return;
    }

    const whitelist = $("#whitelist").value;
    if(!whitelist) {
        $("#testResult").textContent = result;
        return;
    }

    whitelist.split("\n").some(pattern => {
        if(!URLMatchPattern.test(pattern, url)) return false;
        result = "allowed by " + pattern;
        return true;
    });
    $("#testResult").textContent = result;
}
