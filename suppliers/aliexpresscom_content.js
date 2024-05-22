console.log("aliexpresscom")

const sleep = ms => new Promise(r => setTimeout(r, ms))

const maxWait = ms => promise =>
    Promise.race([sleep(ms), promise])

function waitForElementChangeWithMaxWait(selector, maxWaitTime) {
    return Promise.race([waitForElementChange(selector), sleep(maxWaitTime)])
}

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

    //'Commande passée le: 7 mai 2024' Order date: May 7, 2024
    const dateInnerText = elOrderItem.querySelector('.order-item-header-right-info div:nth-child(1)').innerText
    const [,dateText] = dateInnerText.split(': ')

    const date = convertDate(dateText)

    const url = elOrderItem.querySelector('.order-item-header-right a').href;

    const fn = `${date}_aliexpress_${price}_${id}.pdf`

    return { id, price, date, url, fn }
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
    let prevCount = document.querySelectorAll('.order-item').length
    const maxCount = 0 //mean we should get 10+maxCount*10
    for (let i = 0; i < maxCount && getMoreEl(); i++) { // get max 60 order until no more
        getMoreEl().click()
        await waitForElementChangeWithMaxWait('.order-main', 5000)
        let count = document.querySelectorAll('.order-item').length
        if (count !== prevCount + 10)
            console.log(i, 'missing order', prevCount + 10 - count)
        prevCount = count
        await sleep(100) //probably useless, time to have the dom updated?
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

    downloadInvoicesNewTab(orders, 'aliexpresscom')

    // for(const order of orders) {
    //     console.log(order)
    //     // const newWindow = window.open(order.detailLink, '_blank', 'noopener,noreferrer')
    // }
}


async function waitForElementChange(selector) {
    return new Promise((resolve, reject) => {
        // Select the target node
        const targetNode = document.querySelector(selector)

        // Ensure the target node exists
        if (!targetNode) {
            // return reject(new Error(`Element not found for selector: ${selector}`));
            return resolve()
        }

        // Create a mutation observer instance
        const observer = new MutationObserver((mutationsList, observer) => {
            // Resolve the promise when changes are observed
            resolve(mutationsList);

            // Optionally disconnect the observer if you only want to detect the first change
            observer.disconnect();
        });

        // Configuration of the observer
        const config = {
            attributes: true,      // Observe attribute changes
            childList: true,       // Observe addition/removal of child nodes
            subtree: true,         // Observe changes to all descendants
            characterData: true    // Observe changes to the text content
        };

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
    });
}

function getDlButtonEl() {
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
    const targetElement = document.querySelector('.order-status.order-block');
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = 'Dumb';
    inputElement.id = 'check-focus'
    targetElement.parentNode.insertBefore(inputElement, targetElement.nextSibling);

    getDlButtonEl()?.click()

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


if (window.location.href.startsWith('https://www.aliexpress.com/p/order/index.html')) {
    mainOrdersList()
} else if (window.location.href.startsWith('https://www.aliexpress.com/p/order/detail.html')) {
    mainOrderDetail()
}


// async function getLocalStorageDownloadedInvoices() {
//     const {downloadedInvoices} = await callBackgroundFunction('getLocalStorageDownloadedInvoices')
//     return downloadedInvoices ?? []
// }
//
// function addLocalStorageDownloadedInvoices(data) {
//     callBackgroundFunction('addLocalStorageDownloadedInvoices', data)
// }

async function downloadInvoicesNewTab(invoices, supplierKey) {
    callBackgroundFunction('downloadInvoicesNewTab', {invoices, supplierKey})
}

function callBackgroundFunction(action, data = null) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action, data }, response => {
            // if (chrome.runtime.lastError) {
            // reject(chrome.runtime.lastError)
            // } else {
            resolve(response.result)
            // }
        })
    })
}