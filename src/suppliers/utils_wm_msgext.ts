// message from worldmain to background
export const MSGS_EXT_TO_BG = {
    startDate:'startDate',
    downloadInvoicesNewTab: 'downloadInvoicesNewTab'
}

const extensionId = 'pcbgkccklojkacgnadekalpoabbhmpgk'

export async function msg_startDateExt() {
    return await chrome.runtime.sendMessage(extensionId, {action: MSGS_EXT_TO_BG.startDate})
}

export async function msg_downloadInvoicesNewTabExt(invoices: any[], supplier: string) {
    return await chrome.runtime.sendMessage(extensionId, {action: MSGS_EXT_TO_BG.downloadInvoicesNewTab, invoices, supplier})
}
