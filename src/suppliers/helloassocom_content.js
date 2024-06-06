import { msg_downloadInvoices, waitForSelector } from "./utils_content.js";

console.log("helloassocom")

//https://www.helloasso.com/associations/aquinum/adhesions/le-node-coworking-adherent/paiement-attestation/88353670

async function main() {
    // console.time('waitForSelector')
    await waitForSelector('ul#transactions li.Transaction')
    // console.timeEnd('waitForSelector')

    let invoices = []

    const elTransactions = document.querySelectorAll('ul#transactions li.Transaction')
    for(const elTransaction of elTransactions) {
        const elPrice = elTransaction.querySelector('.Transaction--Price');
        const priceText = elPrice.textContent.trim();
        const price = parseFloat(priceText.replace('€', '').replace(',', '.')); // Handle European formatting

        // Extract Date (and convert to YYYY-MM-DD)
        const elDateSpan = elTransaction.querySelector('.Transaction--Date .date');
        const dateParts = elDateSpan.textContent.split('/');
        const date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        // Extract Order ID
        const elReference = elTransaction.querySelector('.Transaction--Reference');
        const referenceText = elReference.textContent.trim();
        const orderIdMatch = referenceText.match(/Commande n°(\d+)/);
        const id = orderIdMatch ? parseInt(orderIdMatch[1]) : null; // Extract number and handle if not found

        const url = `https://www.helloasso.com/associations/aquinum/adhesions/le-node-coworking-adherent/paiement-attestation/${id}`
        const fn = `${date}_helloasso_${price}_${id}.pdf`

        invoices.push({url, fn, id, date})
    }

    console.log(invoices)

    msg_downloadInvoices(invoices, 'helloassocom')
}

main()

//Inifinte wait, not loading, why?
