import { LitElement, html, css } from 'lit'
import {customElement, property} from 'lit/decorators.js'
import './settings-component'
import './cache-list-component'
import './suppliers-component'
import {CacheInvoice, MSGS_FROM_BG_TO_OPTS} from "../utils_commons";
import {CollectedPerSupplier} from "./suppliers-component";

@customElement('options-app')
// @ts-ignore
class OptionsApp extends LitElement {
    static get styles() {
        return css`
            :host {
                display: block;
                padding: 10px;
            }
        `
    }

    @property({ type: Object })
    collected: CollectedPerSupplier = {}
    @property({ type: Array, state: true })
    invoices: string[] = []

    connectedCallback() {
        super.connectedCallback()
        // @ts-ignore
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === MSGS_FROM_BG_TO_OPTS.invoicesDownloaded) {
                const {recent, invoices, supplier} = message
                this.collected = {...this.collected, [supplier]: {total: invoices.length, recent}} //to indicate that it has been updated
                CacheInvoice.get().then(invoices => this.invoices = invoices)
            }
        })

        CacheInvoice.get().then(invoices => this.invoices = invoices)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    render() {
        return html`
            <suppliers-component .collected=${this.collected}></suppliers-component>
            <settings-component></settings-component>
            <cache-list-component .invoices=${this.invoices}></cache-list-component>
        `
    }
}
