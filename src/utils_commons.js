/**
 * Utils used by injected script AND background worker
 * @returns {Promise<any>}
 */


export async function getStartDate() {
    const {startDate} = await chrome.storage.sync.get({startDate: ''})
    return startDate
}

export const sleep = ms => new Promise(r => setTimeout(r, ms))


/**
 * chrome.storage.local can be used by background / options / popup / content
 */
export class CacheInvoice {
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
}


// messages from content to background
export const MSGS_TO_BG = {
    downloadInvoices: 'downloadInvoices',
    downloadInvoicesNewTab: 'downloadInvoicesNewTab',
    downloadInvoicesOpenAi: 'downloadInvoicesOpenAi',
    selectSupplier: 'selectSupplier',
    downloadedInvoices: 'downloadedInvoices'
}

// messages from bg to options
export const MSGS_FROM_BG = {
    invoicesDownloaded: 'invoicesDownloaded'
}
