console.log("auchantelecomfr")

main()

//autologin : https://www.auchantelecom.fr/legacy/connexion/espace-client.html?idt=0602468637

function convertDate(dateStr) {
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month}-${day}`
}

function convertPrice(priceStr) {
    // Remove the currency symbol and any text after the price
    let cleanedStr = priceStr.replace(/[^\d,]/g, '')
    // Replace the comma with a dot
    cleanedStr = cleanedStr.replace(',', '.')
    return cleanedStr
}

async function main() {
    let invoices = []

    for (const tr of document.querySelectorAll("table._c1.liste tbody tr")) {
        const trEls = tr.querySelectorAll("td")
        const dateRaw = trEls[0].textContent
        const date = convertDate(dateRaw)

        const priceRaw = trEls[trEls.length - 2].textContent
        const price = convertPrice(priceRaw)

        const fn = `${date}_auchantelecom_${price}.pdf`
        const inputName = trEls[1].querySelector('input').getAttribute('name')
        const inputValue = trEls[1].querySelector('input').getAttribute('value')
        const url = window.location.origin + document.querySelector('form').getAttribute('action')
        const id = null

        // downloadFormData(url, fn, inputName, inputValue)

        invoices.push({url, fn, inputName, inputValue})
    }

    if(invoices.length === 0) return

    console.log(invoices)

    const localStorageDlInvoices = await getLocalStorageDownloadedInvoices()
    console.log(112)
    const startDate = await getStartDate()

    const addedInvoices = []
    for(const {url, fn, date, inputName, inputValue} of invoices) {
        if(!localStorageDlInvoices.includes(fn)) {
            if(startDate !== null && startDate > date) continue
            console.log('download', fn)
            downloadFormData(url, fn, inputName, inputValue) //could also just click on the link!
            addedInvoices.push(fn)
        }
    }

    addLocalStorageDownloadedInvoices({total: invoices, added: addedInvoices})
}






// doing that on worker, is complex because of //https://stackoverflow.com/questions/77426685/how-to-get-url-createobjecturl-of-a-blob-uint8array-in-a-manifestv3-service-work/77427098#77427098
// below solution works
async function downloadFormData(url, fn, inputName, inputValue) {
    const formData = new FormData()
    formData.append(inputName, inputValue)
    const response = await fetch(url, {
        method: 'POST',
        body: formData
    })
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = fn
    document.body.appendChild(a)
    a.click()
}


async function getLocalStorageDownloadedInvoices() {
    const downloadedInvoices = await callBackgroundFunction('getLocalStorageDownloadedInvoices')
    return downloadedInvoices ?? []
}

function addLocalStorageDownloadedInvoices(data) {
    callBackgroundFunction('addLocalStorageDownloadedInvoices', data)
}

function callBackgroundFunction(action, data = null) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action, data }, response => {
            // if (chrome.runtime.lastError) {
                // reject(chrome.runtime.lastError)
            // } else {
                resolve(response.result)
            // }
        })
    })
}
