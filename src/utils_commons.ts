/**
 * Utils used by injected script AND background worker
 * @returns {Promise<any>}
 */


export async function getStartDate() {
    const {startDate} = await chrome.storage.sync.get({startDate: ''})
    return startDate
}

export async function setStartDate(startDate: string) {
    await chrome.storage.sync.set({startDate})
}

export function getPreviousMonthFirstDay() {
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let firstDayCurrentMonth = new Date(year, month, 1);
    let previousMonth = new Date(firstDayCurrentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    return dateToYYYYMMDD(previousMonth)
}

export function dateToYYYYMMDD(d: Date) {
    let year = d.getFullYear();
    let month = (d.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11
    let day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}


export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))


/**
 * chrome.storage.local can be used by background / options / popup / content
 */
export class CacheInvoice {
    static async get(){
        return (await chrome.storage.local.get({downloadedInvoices: []})).downloadedInvoices
    }

    static async add(keys: string[]) {
        let invoices = await this.get()
        invoices.push(...keys)
        await chrome.storage.local.set({downloadedInvoices: invoices})
    }

    static async clear() {
        await chrome.storage.local.clear() //(await chrome.storage.local.remove
    }

    static async has(key: string) {
        const invoices = await this.get()
        return invoices.includes(key)
    }

    static async remove(key: string) {
        const invoices = await this.get()
        const invoicesFiltered = invoices.filter((v: string) => v !== key)
        await chrome.storage.local.set({downloadedInvoices: invoicesFiltered})
    }
}


// messages from content to background
export const enum MSGS_TO_BG {
    downloadInvoices,
    downloadInvoicesNewTab,
    downloadInvoicesOpenAi,
    selectSupplier,
    downloadedInvoices
}

// messages from bg to options
export const enum MSGS_FROM_BG_TO_OPTS{
    invoicesDownloaded
}
