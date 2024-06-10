import { CacheInvoice, getStartDate } from "../utils_commons";
import { msg_downloadInvoices, parseDateI18n, parsePrice, waitForSelector } from "./utils_content.js";
// import { extractTextFromData } from "./utils_content_pdf.js";

async function mainOrderList() {
    //once \n removed and trimmed, we have:
    //6 juin 2024 - MasterCard finissant par 1234: €92,49 (fr)
    //9 de enero de 2024 - Visa que termina en 9532: €41,23 (es)
    //21 March 2021 - MasterCard ending in 4395: €48,70 (en)
    // 26 dicembre 2020 - MasterCard che termina con 4395: €355,73 (it)
    function parseDelivery(str) {
        str = str.replaceAll('\n', '').trim()
        const dateText = str.substring(0, str.indexOf("-"))
        const priceText = str.substring(str.lastIndexOf(":")+1)

        const date = parseDateI18n(dateText)
        const price = parsePrice(priceText)
        return {date, price}
    }


    // problem is difficulties to map an invoice url with a price, as the order are not respected
    async function fetchDetailsPage(url) {
        const htmlDetailsContent = await (await fetch(url).text())

        let parser = new DOMParser()
        let doc = parser.parseFromString(htmlDetailsContent, 'text/html')

        const deliveryListElts = doc.querySelectorAll('.a-expander-inner .a-row span:nth-child(2)')
        const deliveries = Array.from(deliveryListElts).map(s => parseDelivery(s.textContent))

        const invoicesUrlElts = doc.querySelectorAll('#a-popover-invoiceLinks a[href$="invoice.pdf"]')
        const invoicesUrls = Array.from(invoicesUrlElts).map(a => a.href)

        if(deliveries.length !== invoicesUrls.length) {
            console.warn('not same amount of invoices and deliveries, TODO handle that case; invoice not yet emitted?')
            return
        }

        const invoicesDeliveries = deliveries.map(({date, price}, i) => {
            const fn = `${date}_amazon_${price}.pdf` //fail if multiple items sent seperatly with same price, TODO deliveryId
            const url = invoicesUrls[i] //order is not the same
            return {date, price, fn, url}
        })
        return deliveries
    }

    async function fetchPdfAndExtractData(invoiceUrl) {
        console.log(invoiceUrl)
        const arrayBuf = await((await fetch(invoiceUrl)).arrayBuffer())
        const text = await extractTextFromData(arrayBuf)
        console.log(text)
        const priceRaw = text.match(/Facture Total\s+([\s\S]*?)\s+€/)[1]
        const price = parsePrice(priceRaw)
        const invoiceNumber = text.match(/Numéro de la facture\s+([A-Z0-9]+)/)[1]
        const dateText = text.match(/Date de la facture\/Date de la livraison\s+(\d{2} \w+ \d{4})/)[1]
        const date = parseDateI18n(dateText)
        return {
            price,
            invoiceNumber,
            date
        }
    }

    function getAjaxInvoiceUrl(orderCard) {
        const linkInvoicesAjaxEl = orderCard.querySelector('a[href^="/gp/shared-cs/ajax/invoice/invoice.html"]')
        if(linkInvoicesAjaxEl)
            return linkInvoicesAjaxEl.href

        const linkInvoicesAjaxEl2 = orderCard.querySelector(`span[data-a-popover^='{"url":"/gp/shared-cs/ajax/invoice/invoice.html']`)
        const path = JSON.parse(linkInvoicesAjaxEl2.getAttribute('data-a-popover')).url
        return window.location.origin + path
    }

    await waitForSelector('.order-card')

    // const links = document.querySelectorAll('a[href^="/gp/shared-cs/ajax/invoice/invoice.html"]')

    let invoices = []
    let orders = []//1 order can contains multiples invoices

    const orderCardEls = document.querySelectorAll('.order-card')

    for (const orderCard of orderCardEls) {
        const linkDetailsEl = orderCard.querySelector('a[href^="/gp/css/order-details"]')
        const ajaxInvoiceUrl = getAjaxInvoiceUrl(orderCard) //or click on the button to make it more real
        const orderId = (new URL(ajaxInvoiceUrl)).searchParams.get('orderId')

        const [dateEl, totalPriceEl] = orderCard.querySelectorAll('.a-size-base')
        const dateI18n = dateEl.textContent
        const date = parseDateI18n(dateI18n)

        const startDate = await getStartDate()

        if(startDate > date) continue //TODO Handle pagination

        const totalPriceText = totalPriceEl.textContent
        const totalPrice = parsePrice(totalPriceText) //total price of the order which can be split in multiple payment

        const nbDeliveries = orderCard.querySelectorAll('.delivery-box, .shipment').length
        const nbDeliveriesHasSeller = Array.from(orderCard.querySelectorAll('.delivery-box, .shipment'))
            .filter(el => {el.querySelector(`a[href^="/hz/feedback"]`)})
        // thus number of invoices must be >= (nbDeliveries - nbDeliveriesHasSeller)
        // compare dropdown sellers with sellerId feedback?

        //TODO process only when all delivery of an order has been sent

        const invoicesCached = await CacheInvoice.get()
        const ordersCached = invoicesCached.filter(label => label.includes('_amazon_')).map(label => label.split('_')[3].slice(0, -7))
        if(ordersCached.includes(orderId)) {
            console.log('already process', orderId)
            // create fake orders for ui ?
            // invoicesCached.filter(label => label.includes('_amazon_')).filter(label => label.includes(orderId))
            continue //it will make stats on final display wrong
        }

        //A dirty way could be to only download invoice when all item of an order has been dispatched
        //or better to store that all items of order has been dispatched
        //TODO - need to figure out what is written when the order has just been paid in the dropdown
        // const areAllDispatched = true //mean that invoices of all deliveries has been created - some items is still in "preparation"
        // if(!areAllDispatched) continue




        // const deliveries = await fetchDetailsPage(linkDetailsEl.href)
        // invoices.push({deliveries, totalPrice: priceOrder, date: date, orderId})

        console.log({date, totalPrice, orderId, nbDeliveries})
        const htmlDropDownContent = await (await fetch(ajaxInvoiceUrl)).text()
        let parser = new DOMParser();
        let doc = parser.parseFromString(htmlDropDownContent, 'text/html')
        const invoiceUrlEls = doc.querySelectorAll('a[href$="invoice.pdf"]');
        const invoicesUrls = Array.from(invoiceUrlEls).map(a => a.href)

        for(const [i, url] of invoicesUrls.entries()) {
            // fetchPdfAndExtractData(url)
            const price = nbDeliveries === 1 ? totalPrice : 0
            const fn = `${date}_amazon_${price}_${orderId}-I${i}.pdf`
            invoices.push({
                date,
                price,
                fn,
                url
            })
        }

        orders.push({date, totalPrice, orderId, invoicesUrls, nbDeliveries})
    }
    console.log({orders, invoices})

    msg_downloadInvoices(invoices, 'amazonfr')
}



if (window.location.pathname.startsWith('/gp/css/order-history') || window.location.pathname.startsWith('/your-orders/orders')) {
    mainOrderList()
} else if (window.location.pathname.startsWith('https://www.aliexpress.com/p/order/detail.html')) {
    mainOrderDetail()
}



