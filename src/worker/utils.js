// {a:1} -> {name:'a', value:1}
function transformKVToNameValueAttribute(obj) {
    const [[key, value]] = Object.entries(obj);
    return { name: key, value: value }
}

/**
 * Convert associative array to associative array with name and value attributes
 * Eg [{a:1}] to [{name:'a', value:1}]
 * @param headers
 * @returns {*|null}
 */
export function convertAssoc(headers) {
    return headers
        ? headers.map(obj => transformKVToNameValueAttribute(obj))
        : null
}

export async function waitForTabToClose(tabId) {
    return new Promise((resolve, reject) => {
        // Listener for the tab removal event
        const onRemoved = (removedTabId) => {
            if (removedTabId === tabId) {
                // Remove the listener and resolve the promise
                chrome.tabs.onRemoved.removeListener(onRemoved);
                resolve();
            }
        };

        // Add the listener to the onRemoved event
        chrome.tabs.onRemoved.addListener(onRemoved);
    });
}


function saveBlobAsPDF(blob, fileName) {
    const reader = new FileReader();
    reader.onload = function () {
        const link = document.createElement('a');
        link.href = reader.result;
        link.download = fileName;
        link.click();
    };
    reader.readAsDataURL(blob);
}

// don't work with HMR, if filename is dynamic (otherwise use import)
// https://dev.to/jacksteamdev/advanced-config-for-rpce-3966#dynamic-content-scripts
function injectContentScript(tabId, files) {
    return chrome.scripting.executeScript({
        target: { tabId },
        files: files
    });
}

function injectScriptOnCompleted(files, supplierUrl, tabId) {
    chrome.webNavigation.onCompleted.addListener(e => {
        if(e.tabId === tabId && e.frameId ===0) {
            console.log('onComplete', e, tabId, files)
            injectContentScript(tabId, files)
        }
    }, {
        // url: [{hostEquals: new URL(supplierUrl.invoices).hostname}], //openai, multiple hosts pay/chat
        frameId: 0, //works, but no info in doc, so also above
        tabId: tabId //seems to be ignored
    })
}
