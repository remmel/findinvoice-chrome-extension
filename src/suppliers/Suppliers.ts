export type Supplier = {
    invoices: string;
    matches: string[];
    label: string;
};

export type Suppliers = {
    [key: string]: Supplier;
}

export const SUPPLIERS: Suppliers = {
    aliexpresscom: {
        invoices: 'https://www.aliexpress.com/p/order/index.html',
        matches: ['https://www.aliexpress.com/*'],
        label: 'Aliexpress',
    },
    amazonfr: {
        invoices: 'https://www.amazon.fr/your-orders/orders?timeFilter=months-3&ref_=ppx_yo2ov_dt_b_filter_all_m3',
        matches: ['https://www.amazon.fr/*'],
        label: 'AmazonFr',
    },
    auchantelecomfr: {
        invoices: 'https://www.auchantelecom.fr/fr/client/Consommations/Factures/Default.html',
        matches: ['https://www.auchantelecom.fr/*'],
        label: 'Auchan Telecom',
    },
    helloassocom: {
        invoices: 'https://www.helloasso.com/utilisateur/historique',
        matches: ['https://www.helloasso.com/*'],
        label: 'HelloAsso',
    },
    mobilefreefr: {
        invoices: 'https://mobile.free.fr/account/conso-et-factures',
        matches: ['https://mobile.free.fr/*'],
        label: 'Free Mobile',
    },
    openaicom: {
        invoices: 'https://chat.openai.com/account/manage',
        matches: ['https://chat.openai.com/*', 'https://pay.openai.com/*', "https://*.stripe.com/*"],
        label: 'OpenAI/ChatGPT',
    },
    orangefr: {
        invoices: 'https://espace-client.orange.fr/facture-paiement/',
        matches: ['https://espace-client.orange.fr/*'],
        label: 'Orange (fr)',
    },
    leboncoinfr: {
        invoices: 'https://www.leboncoin.fr/compte/part/mes-transactions',
        matches: ['https://www.leboncoin.fr/*'],
        label: 'Leboncoin',
    }
}
