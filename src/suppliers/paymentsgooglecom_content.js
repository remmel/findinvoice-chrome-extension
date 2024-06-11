import { CacheInvoice, getStartDate, sleep } from "../utils_commons";
import { msg_downloadInvoices, parseDateI18n, parsePrice, waitForSelector } from "./utils_content";


//Sep 17, 2023, Jun 6
function parseDate(str) {
    if(!str.includes(',')) str+=', '+new Date().getFullYear()
    const date = parseDateI18n(str)
    return date
}

async function main() {
    await waitForSelector('table.b3-widget-table', 7000, 250)
    console.log(document.querySelectorAll('table.b3-widget-table'))
    const trs = document.querySelectorAll('table.b3-widget-table tr')

    const cachedInvoices = await CacheInvoice.get()
    const startDate = await getStartDate()

    let invoices = []
    for(const tr of trs) {
        const dataInfoMsgEls = tr.querySelectorAll('[data-info-message]')
        const info = dataInfoMsgEls[0].innerText // 'Google One' 'Google Play Apps'
        const dateInfoRaw = dataInfoMsgEls[1].innerText //'Sep 17, 2023 · 200 GB (Google One)'; 'Oct 17, 2022 · 100 GB (Google One)'; 'Jun 14, 2020 · Udemy Course (Udemy - Online Courses)'
        const infoShort = info.replaceAll(' ','-') //.replace('Google', '').trim()
        let dateRaw = dateInfoRaw.split('·')[0].trim()
        const date = parseDate(dateRaw)

        const priceRaw = dataInfoMsgEls[2].innerText //'-$5.00'; '-€10.99'
        const price = parsePrice(priceRaw)

        const fn = `${date}_google_${price}_${infoShort}.pdf`
        console.log({date, price, info})

        let url = null

        // invoices.push({date, price, fn}) //missing link
        if((!startDate || date >= startDate) && !cachedInvoices.includes(fn)) {
            await tr.click()
            await waitForSelector('h2:nth-child(2)') //don't wait for link, as maybe invoice is not available
            url = document.location.origin + document.querySelector('div[data-url]').getAttribute('data-url')
        }
        invoices.push({date, price, fn, url}) // I also return url null for stats purpose
    }
    console.log(invoices)

    msg_downloadInvoices(invoices, 'paymentsgooglecom')
}

main()
