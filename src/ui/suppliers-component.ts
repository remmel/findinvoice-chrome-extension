import { LitElement, html, css } from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {Suppliers, SUPPLIERS} from "../suppliers/Suppliers"
import { MSGS_TO_BG } from "../utils_commons"



type Collected = {
    total: number; //total number of invoices found (might be only after the startDate or not)
    recent: number; //recent invoices (not cached)
};

export type CollectedPerSupplier = {
    [key: string]: Collected;
}

@customElement('suppliers-component')
// @ts-ignore
class SuppliersComponent extends LitElement {

    suppliers: Suppliers = SUPPLIERS
    @property({ type: Object }) collected: CollectedPerSupplier = {} //invoices which have just been collected

    constructor() {
        super()
    }

    static styles = css`
        .seller {
            display: flex;
            align-items: center;
            margin: 8px 0;
        }
        .seller img {
            width: 24px;
            height: 24px;
            margin-right: 8px;
        }

        button {
            width: 100%;
            max-width: 210px;
            padding: 10px;
        }
    `

    onClickSupplier(supplier: string) {
        chrome.runtime.sendMessage({action: MSGS_TO_BG.selectSupplier, supplier})
    }

    render() {
        return html`
            <div>
                ${Object.entries(this.suppliers).map(([supplierKey, supplier]) => {
                    // @ts-ignore
                    const collected = this.collected[supplierKey]
                    return html`
                        <button class="seller" @click=${() => this.onClickSupplier(supplierKey)}>
                            <img src="/icons/${supplierKey}_64.png" alt="${supplier.label} logo">
                            <span>${supplier.label}</span>
                            ${collected ? html`<span>&nbsp;(${collected.recent}/${collected.total})</span>` : ''}
                        </button>
                    `
                })}
            </div>
        `
    }
}
