import { getStartDate, sleep } from "../utils_commons.js";
import { msg_downloadInvoicesNewTab, waitForElementChange, waitForSelector } from "./utils_content.js";

console.log("aliexpresscom")

function getMoreEl() {
    return document.querySelector('.order-more button')
}

// "May 7, 2024", "Mar 29,2024", "7 mag 2024", "1 apr 2024", "1 abr, 2024",
function convertDate(dateStr) {
    const months_i18n = {
        // pt, es, it, fr
        "Jan": ["jan", "ene", "gen", "janv."],
        "Feb": ["fev", "feb", "feb", "févr."],
        "Mar": ["mar", "mar", "mar", "mars"],
        "Apr": ["abr", "abr", "apr", "avr."],
        "May": ["mai", "may", "mag", "mai"],
        "Jun": ["jun", "jun", "giu", "juin"],
        "Jul": ["jul", "jul", "lug", "juil."],
        "Aug": ["ago", "ago", "ago", "août"],
        "Sep": ["set", "sept", "set", "sept."],
        "Oct": ["out", "oct", "ott", "oct."],
        "Nov": ["nov", "nov", "nov", "nov."],
        "Dec": ["dez", "dic", "dic", "déc."],
    }

    replaceLoop: for (const [engMonth, i18nMonths] of Object.entries(months_i18n)) {
        for (const i18nMonth of i18nMonths) {
            if (dateStr.includes(i18nMonth)) {
                dateStr = dateStr.replace(i18nMonth, engMonth)
                break replaceLoop
            }
        }
    }

    const date = new Date(dateStr)

    const formattedYear = date.getFullYear()
    const formattedMonth = String(date.getMonth() + 1).padStart(2, '0')
    const formattedDay = String(date.getDate()).padStart(2, '0')

    // Return the formatted date string
    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
}

function convertElOrderItem(elOrderItem) {
    // 'Numéro de commande: 123456789\nCopier'
    const orderIdText = elOrderItem.querySelector('.order-item-header-right-info div:nth-child(2)').innerText
    const id = orderIdText.match(/\d+/)[0]

    //'7,96€'
    const priceText = elOrderItem.querySelector('.order-item-content-opt-price-total').innerText
    const price = parseFloat(priceText.replace(',', '.').replace(/[^\d.]/g, ''))

    const date = extractDate(elOrderItem)

    const url = elOrderItem.querySelector('.order-item-header-right a').href;

    const fn = `${date}_aliexpress_${price}_${id}.pdf`

    return { id, price, date, url, fn }
}

function extractDate(elOrderItem) {
    //'Order date: May 7, 2024'
    const dateInnerText = elOrderItem.querySelector('.order-item-header-right-info div:nth-child(1)').innerText
    const [,dateText] = dateInnerText.split(': ')
    return convertDate(dateText)
}

function getLastDate() {
    const elOrderItem = Array.from(document.querySelectorAll('.order-item')).pop() //last order
    return extractDate(elOrderItem)
}

function mergeOrder(orders) {
    let mergedOrders = {}

    for(const order of orders) {
        const id = (order.id+'').substring(0,10)
        if (!mergedOrders[id])
            mergedOrders[id] = {'orders': []}

        mergedOrders[id].orders.push(order)
    }

    for (const [id, mOrder] of Object.entries(mergedOrders)) {
        mOrder.price = mOrder.orders.map(o => o.price).reduce((acc,p)=> acc+p)
        mOrder.dates = [...new Set(mOrder.orders.map(o => o.date))] //uniq
    }
    return mergedOrders
}

// Aliexpress often skip order, should get them in other way, like here https://www.aliexpress.com/p/wallet-ui-follow/card-record.html?pha_manifest=wallet_card_record&bizScene=TRADE
async function mainOrdersList() {
    const startDate = await getStartDate() //will probably also need to use lastRunDate()
    const maxCount = 25 //mean we should get 10+maxCount*10 in theory, knowing that there are 75% missing orders bc of AE bug in pagination

    //wait for jsonp api response (https://acs.aliexpress.com/h5/mtop.aliexpress.trade.buyer.order.list/1.0/) and render
    await waitForSelector('.order-item')
    let prevCount = document.querySelectorAll('.order-item').length
    let lastDate = getLastDate()
    for (let i = 0; i < maxCount && getMoreEl() && (startDate === null || lastDate >= startDate); i++) { // get max 60 order until no more
        getMoreEl().click()
        // wait for https://acs.aliexpress.com/h5/mtop.aliexpress.trade.buyer.order.list/1.0/ api response and render
        await waitForElementChange('.order-main', 5000)
        let count = document.querySelectorAll('.order-item').length
        if (count !== prevCount + 10)
            console.log(i, 'missing order', prevCount + 10 - count)
        prevCount = count
        await sleep(100) //probably useless, time to have the dom updated?
        lastDate = getLastDate()
    }

    const elOrderItems = document.querySelectorAll('.order-item')
    console.log(elOrderItems.length, elOrderItems)

    let orders = []
    for(const elOrderItem of elOrderItems){
        const order = convertElOrderItem(elOrderItem)
        console.log(order)
        orders.push(order)
    }

    const mergedOrders = mergeOrder(orders)
    console.log(mergedOrders)

    msg_downloadInvoicesNewTab(orders, 'aliexpresscom')

    // for(const order of orders) {
    //     console.log(order)
    //     // const newWindow = window.open(order.detailLink, '_blank', 'noopener,noreferrer')
    // }
}


async function getDlButtonEl() {
    await waitForSelector('.order-status.order-block button', 2000, 125)

    const invoiceKeywords = ['Download invoice', 'Descargar factura', 'Télécharger facture']
    const buttons = Array.from(document.querySelectorAll('.order-status.order-block button'))
        .filter(button =>
            invoiceKeywords.some(keyword =>
                button.textContent.includes(keyword)
            )
        )
    if (buttons.length !== 1)
        console.log('Download invoice button not found or multiple', buttons.length)
    return buttons[0]
}

//FIXME not really happy with the "autoclose' code, do the sleep time good for all computer/network connections?
//should better use the replayxhr solution
async function mainOrderDetail(){
    //create a dumb input to catch focus
    // const targetElement = document.querySelector('.order-status.order-block');
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = 'Dumb';
    inputElement.id = 'check-focus'
    // targetElement.parentNode.insertBefore(inputElement, targetElement.nextSibling);
    document.body.insertBefore(inputElement, document.body.firstChild)
    // TODO create export async function waitUntilDialogClosed(){}

    const btnEl = await getDlButtonEl() //it waits for the button to appear (api call)
    btnEl?.click()

    await sleep(2000)

    inputElement.addEventListener('focus', function() {
        window.close()
    })

    //if the use click really quickly on the save/esc button, thus it will be close, because it moves the mouse
    document.addEventListener('mousemove', e => {
        window.close()
    }, false)

    inputElement.focus()
}
//3036434196930926


if (window.location.href.startsWith('https://www.aliexpress.com/p/order/index.html')) {
    mainOrdersList()
} else if (window.location.href.startsWith('https://www.aliexpress.com/p/order/detail.html')) {
    mainOrderDetail()
}
