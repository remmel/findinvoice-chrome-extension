document.querySelectorAll('#btn button').forEach(elt => elt.addEventListener('click', e => {
    const supplier = e.target.getAttribute('data-supplier')
    chrome.runtime.sendMessage({action: 'popup-select-supplier', supplier})
}))

document.querySelector('#btn-options').addEventListener('click', e => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage()
    } else {
        window.open(chrome.runtime.getURL('options.html'))
    }
})

// })()
// chrome.runtime.sendMessage({action: 'getLocalStorageDownloadedInvoices'}, response => {
//     console.log(response)
// })
