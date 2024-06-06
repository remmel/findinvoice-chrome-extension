// HMR is not possible here and extension must be reloaded manually
// https://github.com/crxjs/chrome-extension-tools/discussions/643
// do not inject via script tag, because it will be to late to intercept xhr

// Communicate from webpage (world:main) to worker extension
// https://developer.chrome.com/docs/extensions/develop/concepts/messaging#external-webpage

import {proxyFetch} from "./utils_monkeyPatchFetch"
import {msg_downloadInvoicesNewTabExt} from "./utils_wm_msgext";

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

        msg_downloadInvoicesNewTabExt(invoices, 'leboncoinfr')

        // document.dispatchEvent(new CustomEvent('message', { detail: data }));
    })
}
