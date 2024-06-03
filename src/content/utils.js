// currently, that utils.js is always injected aside ${supplier}_content.js, in the future,
// we could think about using a packager to only provide what is needed
// using module, and importScript
// could try to reproduce similar API than https://pptr.dev/api/puppeteer.waitforselectoroptions

const logToto = () => console.log('toto')

const sleep = ms => new Promise(r => setTimeout(r, ms))

const maxWait = ms => promise =>
Promise.race([sleep(ms), promise])

function waitForSelector(selector, timeout = 5000, interval = 100) {
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

function waitForElementChange(selector, timeout = 30000) {
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

const msg_downloadInvoices = function(invoices, headers = []) {
    chrome.runtime.sendMessage({action: 'downloadInvoices', invoices, headers})
}

const msg_downloadInvoicesNewTab = function(invoices, supplierKey) {
    chrome.runtime.sendMessage({action: 'downloadInvoicesNewTab', invoices, supplierKey})
}

// const msg_storage_startDate = async function() {
//     const result = await chrome.storage.sync.get({startDate: ''})
// }

async function getStartDate() {
    const {startDate} = await chrome.storage.sync.get({startDate: ''})
    return startDate
}


const addStyle = styleString => {
    const style = document.createElement('style')
    style.textContent = styleString
    document.head.append(style)
}
