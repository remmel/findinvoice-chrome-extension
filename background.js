chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed.");
});

const URLS = {
    orangefr: {
        'invoices': 'https://espace-client.orange.fr/facture-paiement/'
    },
    mobilefreefr: {
        'invoices': 'https://mobile.free.fr/account/conso-et-factures'
    }
}

// {a:b} -> {name:a, value:b}
function transformKVToNameValueAttribute(obj) {
    const [[key, value]] = Object.entries(obj);
    return { name: key, value: value }
}

function injectContentScript(tabId, filename) {
    return chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: [filename]
    });
}



async function downloadInvoices({invoices, headers}) {
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
            break;
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

            chrome.webNavigation.onCompleted.addListener(e => {
                if(e.tabId === tabId && e.frameId ===0) {
                    console.log('onComplete', e, tabId)
                    injectContentScript(tabId, `content_${sellerKey}.js`)
                }
            }, {
                url: [{hostEquals: new URL(sellerUrl.invoices).hostname}],
                frameId: 0, //works, but no info in doc, so also above
                tabId: tabId //seems to be ignored
            })
            break;
    }
})
