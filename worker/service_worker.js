import { convertAssoc, sleep } from "./utils.js"
import { ReplayXhr } from "./utilsInterceptResponse.js"
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed.")
});

const URLS = {
    aliexpresscom: {
        'invoices': 'https://www.aliexpress.com/p/order/index.html',
    },
    auchantelecomfr: {
        'invoices': 'https://www.auchantelecom.fr/fr/client/Consommations/Factures/Default.html'
    },
    mobilefreefr: {
        'invoices': 'https://mobile.free.fr/account/conso-et-factures'
    },
    openaicom: {
        'invoices': 'https://chat.openai.com/account/manage' //https://pay.openai.com/
    },
    orangefr: {
        'invoices': 'https://espace-client.orange.fr/facture-paiement/'
    },
}

function injectContentScript(tabId, filename) {
    return chrome.scripting.executeScript({
        target: { tabId },
        files: [filename]
    });
}

function injectScriptOnCompleted(path, supplierUrl, tabId) {
    chrome.webNavigation.onCompleted.addListener(e => {
        if(e.tabId === tabId && e.frameId ===0) {
            console.log('onComplete', e, tabId, path)
            injectContentScript(tabId, path)
        }
    }, {
        // url: [{hostEquals: new URL(supplierUrl.invoices).hostname}], //openai, multiple hosts pay/chat
        frameId: 0, //works, but no info in doc, so also above
        tabId: tabId //seems to be ignored
    })
}



async function downloadInvoices(invoices, headers, preDownload=() =>{}) {
    // await chrome.storage.local.clear()
    const downloadedInvoices = (await chrome.storage.local.get({downloadedInvoices: []})).downloadedInvoices
    let newInvoices = 0
    for(const invoice of invoices) {
        const filename = invoice.fn ?? null;
        const key = invoice.fn ?? invoice.id //to be improved prepending here the provider?

        if (downloadedInvoices.includes(key)) continue //already downloaded

        const headersNV = convertAssoc(headers)

        await preDownload(invoice)

        await chrome.downloads.download({url: invoice.url, filename: invoice.fn, headers: headersNV})
        downloadedInvoices.push(key)
        chrome.storage.local.set({downloadedInvoices: downloadedInvoices})
        newInvoices++
    }
    console.log('downloadInvoices end','Found', invoices.length, 'New', newInvoices)
}


let tab = null

//TODO infinite download?!? with orange

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

//cannot use async directly when returning response, see https://stackoverflow.com/questions/44056271
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'downloadInvoices': {
            const {invoices, headers} = request
            downloadInvoices(invoices, headers).then(_ =>
                chrome.tabs.remove(tab.id)
            )
        }
            break
        case 'downloadInvoicesOpenAi': { //TODO find a more readable way
            const {invoices, headers} = request
            downloadInvoices(invoices, headers, async invoice => {
                const response = await fetch(invoice.url)
                const item = await response.json()
                invoice.url = item.file_url
            }).then(_ =>
                chrome.tabs.remove(tab.id)
            )
        }
            break
        case 'downloadInvoicesNewTab':
            (async () => {
                const {invoices, supplierKey} = request.data //TODO use same url than
                const downloadedInvoices = (await chrome.storage.local.get({downloadedInvoices: []})).downloadedInvoices
                let newInvoices = 0
                for(const invoice of invoices) {
                    const key = invoice.fn //TODO figure out
                    if (downloadedInvoices.includes(key)) continue //already downloaded

                    const {url} = invoice
                    const subtab = await chrome.tabs.create({url}) //, active: false}) //must be active for autoclose
                    injectScriptOnCompleted(`suppliers/${supplierKey}_content.js`, url, subtab.id)

                    await sleep(2000) //avoid opening too many tabs
                    //could also close here the tab
                    //could also check here if the window has been properly opened
                    downloadedInvoices.push(key)
                    newInvoices++
                }

                console.log('downloadInvoices end','Found', invoices.length, 'New', newInvoices)

                //FIXME better listen for download event to mark as downloaded!
                chrome.storage.local.set({downloadedInvoices: downloadedInvoices})
                chrome.tabs.remove(tab.id)
            })()
            return true
        case 'clickpopup':
            loadSupplierUrlAndInject(request.supplier)
            break;

        case 'getLocalStorageDownloadedInvoices':
            (async () => {
                const storage = await chrome.storage.local.get({downloadedInvoices: []})
                sendResponse({result: storage})
            })()
            return true

        case 'addLocalStorageDownloadedInvoices':
            (async () => {
                const {total, added} = request.data //added is fn list
                const {downloadedInvoices} = await chrome.storage.local.get({downloadedInvoices: []})
                downloadedInvoices.push(...added)
                chrome.storage.local.set({downloadedInvoices: downloadedInvoices})
                console.log('downloadIenfrnvoices end','Found', total.length, 'New', added.length)
            })()
            return true
    }
})

async function loadSupplierUrlAndInject(supplierKey) {
    const tabs = await chrome.tabs.query({active: true, lastFocusedWindow: true}) //{active: true, currentWindow: true})
    tab = tabs[0]
    const supplierUrl = URLS[supplierKey]

    // update current tab if its "new tab" or current supplier website
    if (tab.url === "chrome://newtab/" || tab.url.startsWith((new URL(supplierUrl.invoices)).origin))
        tab = await chrome.tabs.update({url: supplierUrl.invoices})
    else
        tab = await chrome.tabs.create({url: supplierUrl.invoices}) //, active: false})

    const tabId = tab.id //important to copy, because below I want the current tabId, not the future current tabId

    console.log('clickpop', tabId)

    injectScriptOnCompleted(`suppliers/${supplierKey}_content.js`, supplierUrl, tabId)
}

