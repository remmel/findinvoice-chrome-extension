export {}
// import only possible using typescript (if .js probably have to configure vite)
// do not use it, because I want to use iife around everything
// HMR is not possible here
// import {proxyFetch} from "./monkeyPatchFetch"; //import only possibe otherwise import not possible in .js
// https://github.com/crxjs/chrome-extension-tools/discussions/643
// do not inject via script tag, because it will be to late to intercept xhr

// iife, to avoid being detected and naming conflicts, TODO how to configure vite to add it
(() => {
    // console.log("leboncoinfr world")

    const proxyFetch = function(callback: (response: Response) => void) {
        const originalFetch = fetch
        window.fetch = async (...args) => {
            let [resource, config ] = args
            const response = await originalFetch(resource, config)
            callback(response)
            return response
        }
    }

// Communicate from webpage (world:main) to worker extension
// https://developer.chrome.com/docs/extensions/develop/concepts/messaging#external-webpage
    const extensionId = 'pcbgkccklojkacgnadekalpoabbhmpgk'

    // async function msg_startDateExt() {
    //     return await chrome.runtime.sendMessage(extensionId, {action: 'startDate'})
    // }

// TODO, should I move that in utils_worldmain.js?
    async function msg_downloadInvoicesNewTabExt(invoices: any[]) {
        return await chrome.runtime.sendMessage(extensionId, {action: 'downloadInvoicesNewTab', invoices})
    }

// callback

    if (window.location.href.startsWith('https://www.leboncoin.fr/compte/part/mes-transactions')) {

        // simpler alternative is to read the dom when populated, kept for example
        proxyFetch(async response => {
            if (!response.url.startsWith("https://api.leboncoin.fr/api/consumergoods/proxy/v3/pages/transactions")) return

            const response2 = response.clone() //to avoid "Response body is already used"

            // const startDate = await msg_startDateExt() //TODO fetch until older date found
            // console.log("startDate3", startDate)

            const data = await response2.json()
            // console.log("data", data)

            // data.reverse()

            let invoices = []
            for (const t of data) {
                const date = t.created_at.substring(0, 10)
                const price = t.price / 100
                const id = t.id.purchase_id
                invoices.push({
                    id,
                    date,
                    url: 'https://www.leboncoin.fr/compte/part/transaction/' + id,
                    price,
                    fn: `${date}_leboncoin_${price}_${id}.pdf` //used for cache
                })
            }
            // console.log(invoices)

            msg_downloadInvoicesNewTabExt(invoices)

            // document.dispatchEvent(new CustomEvent('message', { detail: data }));
        })
    }
})()
