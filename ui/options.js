// import {LitElement, html} from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js'
// https://lit.dev/docs/getting-started/#use-bundles (decorators not available w/o transpiler : https://lit.dev/docs/v1/components/decorators/#enabling-decorators)
// https://developer.chrome.com/docs/extensions/develop/ui/options-page

import { LitElement, html, css } from '../lib/lit-core.min.js'
import './settings-component.js'
import './cache-list-component.js'

class OptionsApp extends LitElement {
    static get styles() {
        return css`
            :host {
                display: block;
                padding: 10px;
            }
        `
    }

    render() {
        return html`
            <settings-component></settings-component>
            <cache-list-component></cache-list-component>
        `
    }
}

customElements.define('options-app', OptionsApp)
