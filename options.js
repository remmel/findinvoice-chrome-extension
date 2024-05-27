document.querySelector('#btn-settings-cache').addEventListener('click', async e => {
    await chrome.runtime.sendMessage({action: 'storage-clear'})
    console.log('renderCacheList')
    renderCacheList()
})

document.querySelector('#btn-settings-cache-add').addEventListener('click', e => {
    addDumbCache()
})



function createList(dataArray, elementId) {
    const ul = document.querySelector(elementId)

    ul.innerHTML = '' //clear previous

    dataArray.forEach(value => {
        const li = document.createElement('li')
        li.textContent = value
        ul.appendChild(li)
    })
}


async function renderCacheList() {
    const cached_invoices = (await chrome.runtime.sendMessage({action: 'getLocalStorageDownloadedInvoices'})).result
    createList(cached_invoices.reverse(), '#list-cache ul')

}

async function addDumbCache() {
    const invoicesKeys = ['2024-05-27_dumb_9.33.pdf']
    await (chrome.runtime.sendMessage({action: 'addLocalStorageDownloadedInvoices', data: {total: invoicesKeys, added: invoicesKeys}}))
    renderCacheList()
}

renderCacheList()
