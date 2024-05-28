export const sleep = ms => new Promise(r => setTimeout(r, ms))

// {a:1} -> {name:'a', value:1}
function transformKVToNameValueAttribute(obj) {
    const [[key, value]] = Object.entries(obj);
    return { name: key, value: value }
}

/**
 * Convert associative array to associative array with name and value attributes
 * Eg [{a:1}] to [{name:'a', value:1}]
 * @param headers
 * @returns {*|null}
 */
export function convertAssoc(headers) {
    return headers
        ? headers.map(obj => transformKVToNameValueAttribute(obj))
        : null
}


export const SELLERS = {
    aliexpresscom: {
        invoices: 'https://www.aliexpress.com/p/order/index.html',
        label: 'Aliexpress'
    },
    auchantelecomfr: {
        invoices: 'https://www.auchantelecom.fr/fr/client/Consommations/Factures/Default.html',
        label: 'Auchan Telecom'
    },
    helloassocom:{
        invoices: 'https://www.helloasso.com/utilisateur/historique',
        label:'HelloAsso'
    },
    mobilefreefr: {
        invoices: 'https://mobile.free.fr/account/conso-et-factures',
        label: 'Free Mobile'
    },
    openaicom: {
        invoices: 'https://chat.openai.com/account/manage', //https://pay.openai.com/
        label: 'OpenAI/ChatGPT'
    },
    orangefr: {
        invoices: 'https://espace-client.orange.fr/facture-paiement/',
        label: 'Orange (fr)'
    },
}

// duplicated code
export async function getStartDate() {
    const {startDate} = await chrome.storage.sync.get({startDate: ''})
    console.log(startDate)
    return startDate
}

