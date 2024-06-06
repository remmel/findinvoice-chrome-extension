import { LitElement, html, css } from 'lit'
import { MSGS_TO_BG, MSGS_FROM_BG } from "../utils_commons.js";
import { SUPPLIERS } from "../worker/utils.js"

class SuppliersComponent extends LitElement {
    static get properties() {
        return {
            suppliers: { type: Object }
        }
    }

    constructor() {
        super()
        this.suppliers = SUPPLIERS
    }

    connectedCallback() {
        super.connectedCallback()
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log(message)
            if(message.action === MSGS_FROM_BG.invoicesDownloaded) {
                const {recent, invoices, supplier} = message
                this.suppliers[supplier].collect = {total: invoices.length, recent}
                this.requestUpdate() // but does not trigger invoices cache list
                // this.suppliers = {
                //     ...this.suppliers,
                //     [supplier]: {
                //         ...this.suppliers[supplier],
                //         collect: { total: invoices.length, recent }
                //     }
                // };
                console.log(this.suppliers)
            }
        })
    }

    disconnectedCallback() {
        super.disconnectedCallback();
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

    onClickSupplier(supplier) {
        chrome.runtime.sendMessage({action: MSGS_TO_BG.selectSupplier, supplier})
    }

    render() {
        return html`
            <div>
                ${Object.entries(this.suppliers).map(([key, supplier]) => html`
                    <button class="seller" @click=${() => this.onClickSupplier(key)}>
                        <img src="/icons/${key}_64.png" alt="${supplier.label} logo">
                        <span>${supplier.label}</span>
                        ${supplier.collect ? html`<span>&nbsp;(${supplier.collect.recent} / ${supplier.collect.total})</span>`: ''}
                    </button>
                `)}
            </div>
        `
    }
}

customElements.define('suppliers-component', SuppliersComponent)
