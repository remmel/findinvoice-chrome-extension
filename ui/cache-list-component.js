import { LitElement, html, css } from '../lib/lit-core.min.js'

const sleep = ms => new Promise(r => setTimeout(r, ms))

class CacheListComponent extends LitElement {
    static get properties() {
        return {
            invoices: {type: Array, state: true}
        }
    }

    constructor() {
        super()
        this.invoices = []
    }

    async connectedCallback() {
        super.connectedCallback()
        await this.loadInvoices()
    }

    async loadInvoices() {
        this.invoices = (await msg_getlocalstroagedlinvoices())
    }

    handleAddInvoice() {
        const min = 5.00, max = 500.00
        const price =  (Math.random() * (max - min) + min).toFixed(2);
        const invoicesKeys = ['2024-05-21_dumb_'+price+'.pdf']
        msg_addlocalstroageinvoice(invoicesKeys, invoicesKeys).then(_ => this.loadInvoices())
    }

    handleClearInvoice() {
        msg_storageClear().then(_ => this.loadInvoices())
    }

    async handleRemoveInvoice(key) {
        const invoices2 = this.invoices.filter(v => v !==key)
        await msg_storageClear()
        await msg_addlocalstroageinvoice(invoices2, invoices2)
        await this.loadInvoices()
    }

    render() {
        return html`
            <h2>Cached downloaded invoice</h2>
            <button @click=${this.handleClearInvoice}>🗑️ Clear cache</button>
            <button @click=${this.handleAddInvoice}>+ Add test</button>
            <table>
                <thead>
                <tr>
                    <th>Invoice Filename</th>
                    <th>🗑️</th>
                </tr>
                </thead>
                <tbody>
                
                ${this.invoices.slice().reverse().map(
                        invoice => html`
                            <tr>
                                <td>${invoice}</td>
                                <td><button @click=${() => this.handleRemoveInvoice(invoice)}>❌</button></td>
                                
                            </tr>
                        `
                )}
                </tbody>
            </table>
        `
    }
}

customElements.define('cache-list-component', CacheListComponent)


async function msg_getlocalstroagedlinvoices() {
    return (await chrome.runtime.sendMessage({action: 'getLocalStorageDownloadedInvoices'})).result
}

async function msg_storageClear() {
    return await chrome.runtime.sendMessage({action: 'storage-clear'})
}

async function msg_addlocalstroageinvoice(total, added) {
    return await (chrome.runtime.sendMessage({action: 'addLocalStorageDownloadedInvoices', data: {total, added}}))
}
