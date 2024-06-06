import { LitElement, html, css } from 'lit'
import { CacheInvoice } from "../utils_commons.js";

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
        this.invoices = await CacheInvoice.getInvoices()
    }

    handleAddInvoice() {
        const min = 5.00, max = 500.00
        const price =  (Math.random() * (max - min) + min).toFixed(2);
        CacheInvoice.addInvoices(['2024-05-21_dumb_'+price+'.pdf']).then(_ => this.loadInvoices())
    }

    handleClearInvoice() {
        CacheInvoice.clear().then(_ => this.loadInvoices())
    }

    async handleRemoveInvoice(key) {
        const invoices2 = this.invoices.filter(v => v !==key)
        await CacheInvoice.clear()
        await CacheInvoice.addInvoices(invoices2)
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
