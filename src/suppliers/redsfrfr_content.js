import { sleep } from "../utils_commons";
import { msg_downloadInvoices, msg_downloadInvoicesNewTab, parseDateI18n, parsePrice } from "./utils_content";

/**
 * It would be easily to control the whole process from the background.
 * But here the page_espaceclient is creating new tabs (one per account) of the invoice page account.
 * The information displayed on the options page, will be wrong when multiple accounts, as it displays only the last one
 */

console.log('redsfrfr')
/**
 * Example of data (after cleaning spaces and newlines)
 * // mobile
 * 'Payé le 21 May - Facture mensuelle du 14/05/2024'
 * 'Payé le 22 Apr - Facture mensuelle - 14 Apr 2024'
 * // fixe
 * 'Facture mensuelle du 03/06/2024'
 * 'Facture mensuelle - 03/05/2024
 * 'Payé le 10/01/2024 - Facture mensuelle - 03/01/2024'
 * @param str
 * @returns {string}
 */
function parseDate(str) {
    str = str.replace(/\s\s+/g, ' ').trim() //remove multiple spaces
    str = str.slice(-11).trim()

    if(str.includes('/')) {
        const [day, month, year] = str.split('/')
        return `${year}-${month}-${day}`
    }
    return parseDateI18n(str)
}

async function page_espaceclient() {
    // const els = Array.from(document.querySelectorAll('#LL li a.R'))
    const els = Array.from(document.querySelectorAll('#LL li a[href^="?e="]'))
    const accountUrls = els.map(el => el.href)

    for(const url of accountUrls) {
        window.open(url)
        await sleep(1000) //to give time to the url and redirection to be done
    }
}

function page_espaceclient_account() {
    const consultInvoiceUrl = document.querySelector('a[href*="consultation"]').href
    window.location = consultInvoiceUrl
}

async function page_consultation(isMobile) {
    //document.querySelector('ul.sr-tabs li:nth-child(2) a').click()

    const els = document.querySelectorAll('.sr-container-content-line:has(.sr-text-grey-14)')
    let invoices = []
    for(const el of els) {

        const dateText = Array.from(el.querySelectorAll('.sr-text-grey-14')).pop().textContent

        const date = parseDate(dateText)

        const priceText = el.querySelector('.sr-text-24BB, .sr-text-16BB').textContent
        const price = parsePrice(priceText)

        const url = el.querySelector('a').href

        const fn = `${date}_redsfrfr_${price}.pdf`

        invoices.push({
            date,
            price,
            url,
            fn
        })
    }
    console.log(invoices)

    msg_downloadInvoices(invoices, 'redsfrfr')
    window.close() //can close like that, as was open here before
}

if(window.location.pathname === '/mon-espace-client/') {
    if(window.location.search === '')
        page_espaceclient()
    else
        page_espaceclient_account()
} else if(['/facture-mobile/consultation', '/facture-fixe/consultation'].includes(window.location.pathname)) {
    page_consultation()
}
