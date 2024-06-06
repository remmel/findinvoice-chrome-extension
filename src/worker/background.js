import { MSGS_EXT_TO_BG } from "../suppliers/utils_wm_msgext";
import { CacheInvoice, getStartDate, MSGS_TO_BG, MSGS_FROM_BG } from "../utils_commons.js";
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
        persistAcrossSessions: false, //don't know
        runAt: 'document_start',
        world: 'MAIN',
    },
])


async function downloadInvoices(invoices, headers, supplier, preDownload=() =>{}) {
    let recent = 0
    const startDate = await getStartDate()
    for(const invoice of invoices) {
        const key = invoice.fn ?? invoice.id //to be improved prepending here the provider?

        if(startDate !== null && startDate > invoice.date) continue
        if(await CacheInvoice.hasInvoice(key)) continue //already downloaded

        const headersNV = convertAssoc(headers)

        await preDownload(invoice)

        await chrome.downloads.download({url: invoice.url, filename: invoice.fn, headers: headersNV})

        await CacheInvoice.addInvoices([key])
        recent++
        // await sleep(50) //to avoid being caught as robot, specially with helloasso
    }
    msg_frombg_invoicesDownloaded(recent, invoices, supplier)
}

/**
 * @param invoices
 * @param supplierKey, if non, the supplier content js won't be injected. In the future use register instead
 * @returns {Promise<void>}
 */
async function downloadInvoiceNewTab(invoices, supplier) {
    let recent = 0
    const startDate = await getStartDate()
    for(const {fn, url, date} of invoices) {
        if(startDate !== null && startDate > date) continue
        if(await CacheInvoice.hasInvoice(fn)) continue //already downloaded

        const subtab = await chrome.tabs.create({url}) //, active: false}) //must be active for autoclose

        await waitForTabToClose(subtab.id)
        //could also close here the tab
        //could also check here if the window has been properly opened
        //FIXME better listen for download event to mark as downloaded!
        CacheInvoice.addInvoices([fn])
        recent++
    }

    console.log('talk to options')
    msg_frombg_invoicesDownloaded(recent, invoices, supplier)


    if(tab)
        chrome.tabs.remove(tab.id)
}

function msg_frombg_invoicesDownloaded(recent, invoices, supplier) {
    console.log('downloadInvoices from',supplier, 'Found', invoices.length, 'New/Recent', recent, invoices)
    chrome.runtime.sendMessage({action: MSGS_FROM_BG.invoicesDownloaded, recent, invoices, supplier})
}

let tab = null

//TODO infinite download?!? with orange

//cannot use async directly when returning response, see https://stackoverflow.com/questions/44056271
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case MSGS_TO_BG.downloadInvoices: {
            const {invoices, headers, supplier} = request
            downloadInvoices(invoices, headers, supplier).then(_ =>
                chrome.tabs.remove(tab.id)
            )
        }
            break
        case MSGS_TO_BG.downloadInvoicesOpenAi: { //TODO find a more readable way
            const {invoices, headers, supplier} = request
            downloadInvoices(invoices, headers, supplier, async invoice => {
                const response = await fetch(invoice.url)
                const item = await response.json()
                invoice.url = item.file_url
            }).then(_ =>
                chrome.tabs.remove(tab.id)
            )
        }
            break
        case MSGS_TO_BG.downloadInvoicesNewTab: {
            const {invoices, supplier} = request
            downloadInvoiceNewTab(invoices, supplier)
            return true
        }

        case MSGS_TO_BG.downloadedInvoices: {
            const {invoices, supplier, recent} = request
            msg_frombg_invoicesDownloaded(recent, invoices, supplier)
            // no need to close
            break
        }

        case MSGS_TO_BG.selectSupplier: {
            const {supplier} = request
            loadSupplierUrlAndInject(supplier)
            break
        }

    }
})

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case MSGS_EXT_TO_BG.startDate:
            (async () => {
                const startDate = await getStartDate()
                sendResponse(startDate)
            })()
            return true

        case MSGS_EXT_TO_BG.downloadInvoicesNewTab:
            (async () => {
                const {invoices, supplier} = request
                await downloadInvoiceNewTab(invoices, supplier)
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
