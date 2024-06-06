
// could try to reproduce similar API than https://pptr.dev/api/puppeteer.waitforselectoroptions
import { MSGS_TO_BG, sleep } from "../utils_commons.js";

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
