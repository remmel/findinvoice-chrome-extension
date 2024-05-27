import { convertAssoc, sleep } from "./utils.js"

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
    helloassocom:{
        'invoices': 'https://www.helloasso.com/utilisateur/historique'
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



async function downloadInvoices(invoices, headers, preDownload=() =>{}) {
    let newInvoices = 0
    for(const invoice of invoices) {
        const key = invoice.fn ?? invoice.id //to be improved prepending here the provider?

        if(await Cache.hasInvoice(key)) continue //already downloaded

        const headersNV = convertAssoc(headers)

        await preDownload(invoice)

        await chrome.downloads.download({url: invoice.url, filename: invoice.fn, headers: headersNV})

        await Cache.addInvoices([key])
        newInvoices++
        // await sleep(50) //to avoid being caught as robot, specially with helloasso
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
                let newInvoices = 0
                for(const invoice of invoices) {
                    const key = invoice.fn //TODO figure out
                    if(await Cache.hasInvoice(key)) continue //already downloaded

                    const {url} = invoice
                    const subtab = await chrome.tabs.create({url}) //, active: false}) //must be active for autoclose
                    injectScriptOnCompleted([`content/utils.js`,`suppliers/${supplierKey}_content.js`], url, subtab.id)

                    await sleep(2000) //avoid opening too many tabs
                    //could also close here the tab
                    //could also check here if the window has been properly opened
                    //FIXME better listen for download event to mark as downloaded!
                    Cache.addInvoices([key])
                    newInvoices++
                }

                console.log('downloadInvoices end','Found', invoices.length, 'New', newInvoices)

                chrome.tabs.remove(tab.id)
            })()
            return true
        case 'popup-select-supplier':
            loadSupplierUrlAndInject(request.supplier)
            break;

        case 'storage-clear':
            (async () => {
                console.log('cache clear in async')
                await Cache.clear()
                sendResponse(true)
            })()
            return true


        case 'getLocalStorageDownloadedInvoices':
            (async () => {
                const downloadedInvoices = await Cache.getInvoices()
                sendResponse({result: downloadedInvoices})
            })()
            return true //true if uses sendResponse, must sendResponse back to properly use await

        case 'addLocalStorageDownloadedInvoices':
            (async () => {
                const {total, added} = request.data //added is fn list
                await Cache.addInvoices(added)
                console.log('downloadInvoices end','Found', total.length, 'New', added.length)
                sendResponse(true)
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

    injectScriptOnCompleted([`content/utils.js`, `suppliers/${supplierKey}_content.js`], supplierUrl, tabId)
}


class Cache{
    static async getInvoices(){
       return (await chrome.storage.local.get({downloadedInvoices: []})).downloadedInvoices
    }

    static async addInvoices(keys) {
        let invoices = await this.getInvoices()
        invoices.push(...keys)
        await chrome.storage.local.set({downloadedInvoices: invoices})
    }

    static async clear() {
        await chrome.storage.local.clear() //(await chrome.storage.local.remove
    }

    static async hasInvoice(key) {
        const invoices = await this.getInvoices()
        return invoices.includes(key)
    }

    //chrome.storage.local.set({downloadedInvoices: downloadedInvoices})

    // async static setInvoc
}
