import { MSGS_TO_BG, sleep } from "../utils_commons";

console.log("openaicom")

function getViewMoreEl() {
    return Array.from(document.querySelectorAll('button'))
        .filter(button =>
            button.querySelector('span')?.textContent.trim() === 'View more'
        )[0]
}

function convertDateStringToYYYYMMDD(dateString) {
    // Create a new Date object from the date string
    const date = new Date(dateString);

    // Get the year, month, and day from the Date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript, so we add 1
    const day = String(date.getDate()).padStart(2, '0');

    // Return the formatted date string
    return `${year}-${month}-${day}`;
}
async function main() {
    if (window.location.href.startsWith('https://pay.openai.com/p/session/')) {
        await sleep(1500) // alternative is to have a loop or MutationObserver
        const viewMoreEl = getViewMoreEl()
        if(viewMoreEl) {
            getViewMoreEl().click()
            await sleep(1500)
        }

        let invoices = []

        for (const ahref of document.querySelectorAll('a[href^="https://invoice.stripe.com/"]')) {
            const dateText = ahref.text //19 Apr 2024
            const date = convertDateStringToYYYYMMDD(dateText)

            const priceText = ahref.parentElement.nextSibling.textContent
            const fn = `${date}_openai_${priceText}.pdf`

            const href = ahref.href
            const url = href.replace('https://invoice.stripe.com/i/', 'https://invoicedata.stripe.com/invoice_pdf_file_url/')

            // const response = await fetch(url) //blocked by cors policy

            invoices.push({url, fn, id:null, date})
        }
        console.log(invoices)
        await chrome.runtime.sendMessage({action: MSGS_TO_BG.downloadInvoicesOpenAi, invoices, supplier: 'openaicom'})
    }
}


main()
