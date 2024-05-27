console.log("orangefr")

if (window.location.href.startsWith('https://login.orange.fr/')) {
    // the password is not saved, put proposed by password manager
    // document.querySelector('#btnSubmit')?.click()
} else if (window.location.href.startsWith('https://espace-client.orange.fr/')) { //https://espace-client.orange.fr/facture-paiement/

    fetchInvoices()
}
async function fetchInvoices() {
    let invoices = [] //{url, fn, id}

    let responsePromise1 =
        fetch("https://espace-client.orange.fr/ecd_wp/portfoliomanager/portfolio?filter=telco,security&includeContracts=true&includeFamilies=true&includeServices=true", {
            "headers": {
                "accept": "application/json;version=1",
                // "accept-language": "en-GB,en;q=0.9",
                // "cache-control": "no-cache, no-store",
                // "content-type": "application/json",
                // "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                // "sec-ch-ua-mobile": "?0",
                // "sec-ch-ua-platform": "\"Linux\"",
                // "sec-fetch-dest": "empty",
                // "sec-fetch-mode": "cors",
                // "sec-fetch-site": "same-origin",
                // "x-app-device-type": "desktop",
                "x-orange-caller-id": "ECQ",
                // "x-orange-origin-id": "ECQ",
                // "x-orange-request-id": "bdaa0ffd-4687-4766-8e1f-ae6394753ef0",
                // "x-orange-session-id": "43117ba8-e66a-4fe6-8add-4f7b8d8d0d6a"
            },
            // "referrer": "https://espace-client.orange.fr/page-accueil",
            // "referrerPolicy": "strict-origin-when-cross-origin",
            // "body": null,
            // "method": "GET",
            // "mode": "cors",
            // "credentials": "include"
        })

    let porfolio = await(await responsePromise1).json()
    for(const contract of porfolio.contracts) { //await Promise.all(porfolio.contracts.map(async contract => {
        let responsePromise2 =
            fetch(`https://espace-client.orange.fr/ecd_wp/facture/v2.0/billsAndPaymentInfos/users/current/contracts/${contract.cid}?detail=true`, {
                "headers": {
                    // "accept": "application/json",
                    // "accept-language": "en-GB,en;q=0.9,fr;q=0.8,fr-GB;q=0.7,es-FR;q=0.6,es;q=0.5,en-ES;q=0.4,en-US;q=0.3",
                    // "cache-control": "no-cache, no-store",
                    // "content-type": "application/json",
                    // "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                    // "sec-ch-ua-mobile": "?0",
                    // "sec-ch-ua-platform": "\"Linux\"",
                    // "sec-fetch-dest": "empty",
                    // "sec-fetch-mode": "cors",
                    // "sec-fetch-site": "same-origin",
                    // "x-app-device-type": "desktop",
                    "x-orange-caller-id": "ECQ",
                    // "x-orange-origin-id": "ECQ",
                    // "x-orange-request-id": "cd23c815-6b40-4654-886f-740ff22bad6f",
                    // "x-orange-session-id": "47daff7c-b319-4bf5-9875-909efeff9476"
                },
                // "referrer": "https://espace-client.orange.fr/facture-paiement/9095681262/historique-des-factures",
                // "referrerPolicy": "strict-origin-when-cross-origin",
                // "body": null,
                // "method": "GET",
                // "mode": "cors",
                // "credentials": "include"
            })

        let bills = await(await responsePromise2).json()

        bills.billsHistory.billList.forEach(bill => {
            let fn = `${bill.date}_orange_${bill.amount/100}.pdf`
            invoices.push({url: 'https://espace-client.orange.fr/ecd_wp/facture/v1.0/pdf'+bill.hrefPdf, fn, id: bill.id})
            console.log(invoices)
        })
    }

    msg_downloadInvoices(invoices, [{"x-orange-caller-id": "ECQ"}])
}
