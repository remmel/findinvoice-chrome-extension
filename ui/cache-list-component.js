import { LitElement, html, css } from '../lib/lit-core.min.js'

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
        this.invoices = (await msg_getlocalstroagedlinvoices()).reverse()
    }

    handleAddInvoice() {
        const invoicesKeys = ['2024-05-21_dumb_9.33.pdf']
        msg_addlocalstroageinvoice(invoicesKeys, invoicesKeys).then(_ => this.loadInvoices())
    }

    handleClearInvoice() {
        msg_storageClear().then(_ => this.loadInvoices())
    }

    render() {
        return html`
            <h2>Download invoice / cache</h2>
            <button @click=${this.handleClearInvoice}>🗑️ Clear cache</button>
            <button @click=${this.handleAddInvoice}>+ Add test</button>
            <table>
                <thead>
                <tr>
                    <th>Invoice Filename</th>
                </tr>
                </thead>
                <tbody>
                ${this.invoices.map(
                        invoice => html`
                            <tr>
                                <td>${invoice}</td>
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
