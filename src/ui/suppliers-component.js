import { LitElement, html, css } from 'lit'
import { SUPPLIERS } from "../worker/utils.js"

class SuppliersComponent extends LitElement {
    static get properties() {
        return {
            sellers: { type: Array }
        }
    }

    constructor() {
        super()
        this.suppliers = SUPPLIERS
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
            max-width: 200px;
            padding: 10px;
        }
    `

    onClickSupplier(supplier) {
        chrome.runtime.sendMessage({action: 'popup-select-supplier', supplier})
    }

    render() {
        return html`
            <div>
                ${Object.entries(this.suppliers).map(([key, supplier]) => html`
                    <button class="seller" @click=${() => this.onClickSupplier(key)}>
                        <img src="../icons/${key}_64.png" alt="${supplier.label} logo">
                        <span>${supplier.label}</span>
                    </button>
                `)}
            </div>
        `
    }
}

customElements.define('suppliers-component', SuppliersComponent)
