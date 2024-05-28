console.log("mobilefreefr")

if (window.location.href.startsWith('https://mobile.free.fr/account/v2/login')) {
    // this is not working, as the Google Password Manager to let the extension see the username/password until the user interact with the page
    // a workaround is to store the password
    // could also wait for field update, to click on the button
    if(document.querySelector('#login-username').value.length
        && document.querySelector('#login-password').value.length) {
        document.querySelector('#auth-connect')?.click()
    }

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
        const date = `${year}-${month}-${day}`
        const fn = `${date}_freemobile_${price}.pdf`
        const id = urlobj.searchParams.get('id') //to avoid redownloading
        //chrome.runtime.sendMessage({ action: 'downloadInvoice', url, fn, id })
        invoices.push({url, fn, id, date})
    })
    chrome.runtime.sendMessage({action: 'downloadInvoices', invoices})
}
