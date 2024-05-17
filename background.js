chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed.");
});

const URLS = {
    orangefr: {
        'invoices': 'https://espace-client.orange.fr/facture-paiement/'
    },
    mobilefreefr: {
        'invoices': 'https://mobile.free.fr/account/conso-et-factures'
    },
    openaicom: {
        'invoices': 'https://chat.openai.com/account/manage' //https://pay.openai.com/
        // 'invoices': 'https://pay.openai.com/p/session/live_YWNjdF8xSE9yU3dDNmgxbnhHb0kzLF9RN2V2enowV2I1M3UyNmZGRndUNHozaWtpSElsNEFr0100Rs8vSlRE'
    }
}

// {a:b} -> {name:a, value:b}
function transformKVToNameValueAttribute(obj) {
    const [[key, value]] = Object.entries(obj);
    return { name: key, value: value }
}

function injectContentScript(tabId, filename) {
    return chrome.scripting.executeScript({
        target: { tabId },
        files: [filename]
    });
}

function injectSellerScriptOnCompleted(sellerKey, sellerUrl, tabId) {
    chrome.webNavigation.onCompleted.addListener(e => {
        if(e.tabId === tabId && e.frameId ===0) {
            console.log('onComplete', e, tabId)
            injectContentScript(tabId, `content_${sellerKey}.js`)
        }
    }, {
        // url: [{hostEquals: new URL(sellerUrl.invoices).hostname}], //openai, multiple hosts pay/chat
        frameId: 0, //works, but no info in doc, so also above
        tabId: tabId //seems to be ignored
    })
}



async function downloadInvoices({invoices, headers}, preDownload=() =>{}) {
    // await chrome.storage.local.clear()
    const storage = await chrome.storage.local.get({downloadedInvoices: []});
    let newInvoices = 0
    for(const invoice of invoices) {
        const filename = invoice.fn ?? null;
        const invoiceId = invoice.fn ?? invoice.id //to be improved prepending here the provider?

        const downloadedInvoices = storage.downloadedInvoices;

        if (!downloadedInvoices.includes(invoiceId)) {
            const headersNV = headers
                ? headers.map(obj => transformKVToNameValueAttribute(obj))
                : null

            await preDownload(invoice)

            await chrome.downloads.download({url: invoice.url, filename: invoice.fn, headers: headersNV})
            downloadedInvoices.push(invoiceId);
            chrome.storage.local.set({downloadedInvoices: downloadedInvoices})
            newInvoices++
        }
    }
    console.log('downloadInvoices end','Found', invoices.length, 'New', newInvoices)
}


let tab = null

//TODO infinite download?!? with orange

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    switch (request.action) {
        case 'downloadInvoices':
            downloadInvoices(request)
            chrome.tabs.remove(tab.id)
            break
        case 'downloadInvoicesOpenAi': //TODO find a more readable way
            downloadInvoices(request, async invoice => {
                const response = await fetch(invoice.url)
                const item = await response.json()
                invoice.url = item.file_url
            })
            chrome.tabs.remove(tab.id)
            break
        case 'clickpopup':
            const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true }) //{active: true, currentWindow: true})
            tab = tabs[0]
            const sellerKey = request.seller
            const sellerUrl = URLS[sellerKey]

            // update current tab if its "new tab" or current seller website
            if(tab.url === "chrome://newtab/" || tab.url.startsWith((new URL(sellerUrl.invoices)).origin))
                tab = await chrome.tabs.update({url: sellerUrl.invoices})
            else
                tab = await chrome.tabs.create({url: sellerUrl.invoices})

            const tabId = tab.id //important to copy, because below I want the current tabId, not the future current tabId

            console.log('clickpop', tabId)

            injectSellerScriptOnCompleted(sellerKey, sellerUrl, tabId)

            break;
    }
})

//works but add a "banner", would need also to filter responses
function interceptXhrResponseUsingDebugger(tabId) {
    chrome.debugger.attach({tabId: tabId}, '1.0', e => {
        chrome.debugger.sendCommand({tabId: tabId}, "Network.enable")
        chrome.debugger.onEvent.addListener((debuggeeId, message, params) => {
            if (tabId !== debuggeeId.tabId) return
            if(message !== "Network.responseReceived") return
            if(!params.response.url.startsWith("https://pay.openai.com/v1/billing_portal/sessions/")) return

            chrome.debugger.sendCommand({tabId}, "Network.getResponseBody", {"requestId": params.requestId}, response => {
                console.log("body?", response, debuggeeId, {message, params})
                //     chrome.debugger.detach(debuggeeId);
            })

        })
    })
}

// response is empty
function interceptXhrResponseUsingDebugger2(tabId) {
    chrome.webRequest.onCompleted.addListener(
        function (details) {
            // Filter for XHR requests
            if (details.type === 'xmlhttprequest') {
                console.log('XHR completed from:', details.url);
                // Intercept the response body
                chrome.debugger.attach({tabId: details.tabId}, "1.3", () => {
                    chrome.debugger.sendCommand({tabId: details.tabId}, "Network.getResponseBody", {requestId: details.requestId}, response => {
                            console.log('Response body:', response);
                            chrome.debugger.detach({tabId: details.tabId});
                        }
                    );
                });
            }
        },
        {urls: ["*://*.openai.com/*"]}
    );
}

function replayXhr(tabId) {
    chrome.webRequest.onBeforeSendHeaders.addListener(details=> {
            console.log('details:', details)
            return {requestHeaders: details.requestHeaders};
        },
        {urls: ["<all_urls>"]},
        ["requestHeaders"]
    );
}


function monkeyPatchXHR() {
    console.log('injecting')
    window.toto = () => console.log('toto')
    (function() {
        console.log('injecting2')
        window.toto = () => console.log('toto2')
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._url = url;  // Save the URL for later use
            return originalOpen.call(this, method, url, ...rest);
        };

        XMLHttpRequest.prototype.send = function(body) {
            this.addEventListener('load', function() {
                console.log('intercept', this)
                // if (this.responseType === '' || this.responseType === 'text') {
                //     console.log('XHR URL:', this._url);
                //     console.log('XHR Response:', this.responseText);
                // }
            });
            return originalSend.call(this, body);
        };
    })();
}
