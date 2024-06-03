//import { proxyFetch } from "/src/suppliers/utils_worldmain.js" //import not possible
console.log("leboncoinfr world")

// Communicate from webpage (world:main) to worker extension
// https://developer.chrome.com/docs/extensions/develop/concepts/messaging#external-webpage
const extensionId = 'pcbgkccklojkacgnadekalpoabbhmpgk'
async function msg_startDateExt() {
    return await chrome.runtime.sendMessage(extensionId, {action: 'startDate'})
}

// TODO, should I move that in utils.js?
async function msg_downloadInvoicesNewTabExt(invoices){
    return await chrome.runtime.sendMessage(extensionId, {action: 'downloadInvoicesNewTab', invoices})
}

// callback

if(window.location.href.startsWith('https://www.leboncoin.fr/compte/part/mes-transactions')) {

    let invoices = []

    // simpler alternative is to read the dom when populated, kept for example
    proxyFetch(async response => {
        if(!response.url.startsWith("https://api.leboncoin.fr/api/consumergoods/proxy/v3/pages/transactions"))  return

        const response2 = response.clone() //to avoid "Response body is already used"

        // console.log("transactions", response, await toto())
        // chrome.storage.sync.get({startDate: ''}).then(r => console.log("sync", r))

        const startDate = await msg_startDateExt() //TODO fetch until older date found
        console.log("startDate3", startDate)

        const data = await response2.json()
        console.log("data", data)

        // data.reverse()

        let invoices = []
        for(const t of data) {
            const date = t.created_at.substring(0,10)
            const price = t.price/100
            const id = t.id.purchase_id
            invoices.push({
                id,
                date,
                url: 'https://www.leboncoin.fr/compte/part/transaction/'+ id,
                price,
                fn: `${date}_leboncoin_${price}_${id}.pdf` //used for cache
            })
        }
        console.log(invoices)

        msg_downloadInvoicesNewTabExt(invoices)

        // document.dispatchEvent(new CustomEvent('message', { detail: data }));
    })
}

