console.log('content.js')

if (window.location.href.startsWith('https://mobile.free.fr/account/v2/login')) {
    // If we are on the login page, click the login button
    document.querySelector('#auth-connect')?.click()
} else if (window.location.href.startsWith('https://mobile.free.fr/account/conso-et-factures')) {

    let invoices = []
    // If we are on the invoices page, download the invoices
    document.querySelectorAll(".table-row.invoice").forEach(invoiceElement => {
        const price = invoiceElement.querySelector(".table-price").textContent.trim().replace("€", "")
        const url = invoiceElement.querySelector("a[href*='facture=pdf']").href
        const urlobj = new URL(url)
        const dateParam = urlobj.searchParams.get('date')
        const year = dateParam.slice(0, 4)
        const month = dateParam.slice(4, 6)
        const day = dateParam.slice(6, 8)
        const fn = `${year}-${month}-${day}_freemobile_${price}.pdf`
        const id = urlobj.searchParams.get('id') //to avoid redownloading
        //chrome.runtime.sendMessage({ action: 'downloadInvoice', url, fn, id })
        invoices.push({url, fn, id})
    })
    chrome.runtime.sendMessage({action: 'downloadInvoices', invoices})
}
