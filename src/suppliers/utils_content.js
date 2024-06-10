
// could try to reproduce similar API than https://pptr.dev/api/puppeteer.waitforselectoroptions
import { MSGS_TO_BG, sleep } from "../utils_commons";

export function waitForSelector(selector, timeout = 5000, interval = 100) {
    return new Promise((resolve, reject) => {
        const intervalId = setInterval(() => {
            const element = document.querySelector(selector)
            if (element) {
                clearInterval(intervalId)
                resolve(element)
            }
        }, interval) // Check every 100 milliseconds

        setTimeout(() => {
            clearInterval(intervalId)
            reject(new Error(`Timeout waiting for selector: ${selector}`))
        }, timeout)
    })
}

// export function waitForDefined(getElementFn, timeout = 1000, inter val = 50) {
//     return new Promise((resolve, reject) => {
//         const startTime = Date.now();
//
//         function checkElement() {
//             const element = getElementFn();
//             if (element) {
//                 resolve(element);
//             } else if (Date.now() - startTime < timeout) {
//                 setTimeout(checkElement, interval);
//             } else {
//                 reject(new Error('Element not found within the timeout period'));
//             }
//         }
//
//         checkElement();
//     });
// }

export function waitForElementChange(selector, timeout = 30000) {
    return Promise.race([_waitForElementChange(selector), sleep(timeout)])
}

async function _waitForElementChange(selector) {
    return new Promise((resolve, reject) => {
        // Select the target node
        const targetNode = document.querySelector(selector)

        // Ensure the target node exists
        if (!targetNode) {
            console.error(`Element not found for selector: ${selector}`)
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

export const msg_downloadInvoices = function(invoices, supplier, headers = []) {
    chrome.runtime.sendMessage({action: MSGS_TO_BG.downloadInvoices, invoices, supplier, headers})
}

export const msg_downloadInvoicesNewTab = function(invoices, supplier) {
    chrome.runtime.sendMessage({action: MSGS_TO_BG.downloadInvoicesNewTab, invoices, supplier})
}

export const msg_downloadedInvoices = async function(invoices, supplier, recent) {
    await chrome.runtime.sendMessage({action: MSGS_TO_BG.downloadedInvoices, invoices, supplier, recent})
}

export const addStyle = styleString => {
    const style = document.createElement('style')
    style.textContent = styleString
    document.head.append(style)
}

// "May 7, 2024", "Mar 29,2024", "7 mag 2024", "1 apr 2024", "1 abr, 2024", "7 de enero de 2024"
export function parseDateI18n(dateStr) {
    const months_i18n = {
        // pt, es, it, fr
        "Jan": ["de enero de", "jan", "ene", "gen", "janv."],
        "Feb": ["de febrero de", "fev", "feb", "feb", "févr."],
        "Mar": ["de marzo de", "mar", "mar", "mar", "mars"],
        "Apr": ["de abril de", "abr", "abr", "apr", "avr."],
        "May": ["de mayo de", "mai", "may", "mag", "mai"],
        "Jun": ["de junio de", "jun", "jun", "giu", "juin"],
        "Jul": ["de julio de", "jul", "jul", "lug", "juil."],
        "Aug": ["de agosto de", "ago", "ago", "ago", "août"],
        "Sep": ["de septiembre de", "set", "sept", "set", "sept."],
        "Oct": ["de octubre de", "out", "oct", "ott", "oct."],
        "Nov": ["de noviembre de", "nov", "nov", "nov", "nov."],
        "Dec": ["de diciembre de", "dez", "dic", "dic", "déc."],
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

//'136,35 €'
export function parsePrice(priceText) {
    return parseFloat(priceText.replace(',', '.').replace(/[^\d.]/g, ''))
}
