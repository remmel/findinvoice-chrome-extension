import { getStartDate } from "../utils_commons.js";
import { convertAssoc, SUPPLIERS, waitForTabToClose } from "./utils.js"

// /!\ no HMR :(, webpage reloaded, but extension must be reloaded manually (or changes here in background.js)
// import leboncoin_mainWorld from '../suppliers/leboncoinfr_content_worldmain?script&module'

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed.")
})

// console.log({leboncoin_mainWorld})


chrome.scripting.registerContentScripts([
    {
        id: 'XMLOverride',
        // js: [leboncoin_mainWorld],
        js: ["build-iife/leboncoinfr_content_worldmain.js"],
        // js: ["build-iife/countxhr_worldmain.js"],
        matches: ["https://www.leboncoin.fr/*"], //also in host_permissions
        persistAcrossSessions: true,
        runAt: 'document_start',
        world: 'MAIN',
    },
])


async function downloadInvoices(invoices, headers, preDownload=() =>{}) {
    let newInvoices = 0
    const startDate = await getStartDate()
    for(const invoice of invoices) {
        const key = invoice.fn ?? invoice.id //to be improved prepending here the provider?

        if(startDate !== null && startDate > invoice.date) continue
        if(await Cache.hasInvoice(key)) continue //already downloaded

        const headersNV = convertAssoc(headers)

        await preDownload(invoice)

        await chrome.downloads.download({url: invoice.url, filename: invoice.fn, headers: headersNV})

        await Cache.addInvoices([key])
        newInvoices++
        // await sleep(50) //to avoid being caught as robot, specially with helloasso
    }
    console.log('downloadInvoices','Found', invoices.length, 'New/Recent', newInvoices, invoices)
}

/**
 * @param invoices
 * @param supplierKey, if non, the supplier content js won't be injected. In the future use register instead
 * @returns {Promise<void>}
 */
async function downloadInvoiceNewTab(invoices, supplierKey = null) {
    let newInvoices = 0
    const startDate = await getStartDate()
    for(const {fn, url, date} of invoices) {
        if(startDate !== null && startDate > date) continue
        if(await Cache.hasInvoice(fn)) continue //already downloaded

        const subtab = await chrome.tabs.create({url}) //, active: false}) //must be active for autoclose
        // if(supplierKey)
        //     injectScriptOnCompleted([`src/content/utils.js`,`src/suppliers/${supplierKey}_content.js`], url, subtab.id)

        await waitForTabToClose(subtab.id)
        //could also close here the tab
        //could also check here if the window has been properly opened
        //FIXME better listen for download event to mark as downloaded!
        Cache.addInvoices([fn])
        newInvoices++
    }

    console.log('downloadInvoices','Found', invoices.length, 'New/Recent', newInvoices, invoices)

    if(tab)
        chrome.tabs.remove(tab.id)
}


let tab = null

//TODO infinite download?!? with orange

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
            const {invoices, supplierKey} = request
            downloadInvoiceNewTab(invoices, supplierKey)
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

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'startDate':
            (async () => {
                const startDate = await getStartDate()
                sendResponse(startDate)
            })()
            return true

        case 'downloadInvoicesNewTab':
            (async () => {
                const {invoices} = request
                await downloadInvoiceNewTab(invoices)
                sendResponse(true)
            })()
            return true
    }
})



async function loadSupplierUrlAndInject(supplierKey) {
    const tabs = await chrome.tabs.query({active: true, lastFocusedWindow: true}) //{active: true, currentWindow: true})
    tab = tabs[0]
    const supplierUrl = SUPPLIERS[supplierKey]

    // update current tab if its "new tab" or current supplier website
    if (tab.url === "chrome://newtab/" || tab.url.startsWith((new URL(supplierUrl.invoices)).origin))
        tab = await chrome.tabs.update({url: supplierUrl.invoices})
    else
        tab = await chrome.tabs.create({url: supplierUrl.invoices}) //, active: false})

    const tabId = tab.id //important to copy, because below I want the current tabId, not the future current tabId

    console.log('clickpop', tabId)

    // injectScriptOnCompleted([`src/content/utils.js`, `src/suppliers/${supplierKey}_content.js`], supplierUrl, tabId)
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
