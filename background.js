chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed.");
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    switch (request.action) {
        case 'downloadInvoices':
            const storage = await chrome.storage.local.get({downloadedInvoices: []});
            request.invoices.forEach(invoice => {
                const filename = invoice.fn ?? null;
                const invoiceId = invoice.fn ?? invoice.id //to be improved prepending here the provider?

                console.log(invoice)
                const downloadedInvoices = storage.downloadedInvoices;

                if (!downloadedInvoices.includes(invoiceId)) {
                    chrome.downloads.download({url: invoice.url, filename: invoice.fn});
                    downloadedInvoices.push(invoiceId);
                    chrome.storage.local.set({downloadedInvoices: downloadedInvoices})
                }
            });
            break;
        case 'createFreeMobileTab':
            chrome.tabs.create({url: 'https://mobile.free.fr/account/conso-et-factures'}).then(tab => {
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    files: ['content.js']
                });
            })
            break;
    }
});
