"use strict";

/**
 * Listener
 * @param {object} details
 */
function onBeforeRequestListener(details) {
    console.debug("onBeforeRequest", details.url);
    if(window.whitelist.some(pattern => pattern.test(details.url))) return {cancel: false};

    return confirm("This URL is blocked and not in whitelist.\nSure to go?")
        ? {cancel: false}
        : {redirectUrl: proxy.runtime.getURL("options.html")}
    ;
}

function listenerReload() {
    getData({blocklist: "", whitelist: ""})
    .then(storage => {
        proxy.webRequest.onBeforeRequest.removeListener(onBeforeRequestListener);

        const blocklist = storage.blocklist.split("\n").filter(x => URLMatchPattern.test(x));
        if(!blocklist.length) return;
        proxy.webRequest.onBeforeRequest.addListener(
            onBeforeRequestListener,
            {urls: blocklist, types: ["main_frame"]},
            ["blocking"]
        );

        window.whitelist = storage.whitelist.split("\n")
            .map(pattern => {
                try {
                    return new URLMatchPattern(pattern);
                }
                catch(e) { return false; }
            })
            .filter(x => !!x)
        ;
    });
}

proxy.runtime.onMessage.addListener(message => {
    switch(message) {
        case "targetListUpdated":
            listenerReload();
            break;
        default:
            console.warn("unknown message");
    }
});

listenerReload();
