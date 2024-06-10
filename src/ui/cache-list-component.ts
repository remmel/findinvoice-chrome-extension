import { LitElement, html } from 'lit'
import {customElement, property} from 'lit/decorators.js';
import { CacheInvoice } from "../utils_commons";

@customElement('cache-list-component')
// @ts-ignore
class CacheListComponent extends LitElement {

    @property({ type: Array, state: true })
    invoices: string[] = []

    constructor() {
        super()
    }

    async loadInvoices() {
        this.invoices = await CacheInvoice.get()
    }

    handleAddInvoice() {
        const min = 5.00, max = 500.00
        const price =  (Math.random() * (max - min) + min).toFixed(2);
        CacheInvoice.add(['2024-05-21_dumb_'+price+'.pdf']).then(_ => this.loadInvoices())
    }

    handleClearInvoice() {
        CacheInvoice.clear().then(_ => this.loadInvoices())
    }

    async handleRemoveInvoice(key: string) {
        await CacheInvoice.remove(key)
        await this.loadInvoices()
    }

    render() {
        return html`
            <h2>Cached downloaded invoice</h2>
            List of invoices which have been downloaded.<br />
            If you want to re-download it later, you have to remove it from the cache.<br />
            The objective of that cache is to prevent from re-downloading an invoice that you have already downloaded.<br />
            That list is here for debugging purposes.<br />
            <br />
            <!--<button @click=${this.handleAddInvoice}>+ Add test</button>-->
            <table>
                <thead>
                <tr>
                    <th>Invoice Filename</th>
                    <th><button title="Clear cache" @click=${this.handleClearInvoice}>🗑️</button></th>
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
