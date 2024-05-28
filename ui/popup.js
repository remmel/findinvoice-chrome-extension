// import {LitElement, html} from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js'
// https://lit.dev/docs/getting-started/#use-bundles (decorators not available w/o transpiler : https://lit.dev/docs/v1/components/decorators/#enabling-decorators)
// https://developer.chrome.com/docs/extensions/develop/ui/options-page

import { LitElement, html, css } from '../lib/lit-core.min.js'
import './suppliers-component.js'

class PopupApp extends LitElement {
    static get styles() {
        return css`
            button {
                width: 100%;
                padding: 10px;
            }
        `
    }

    onClickOptionPage() {
        chrome.runtime.openOptionsPage
            ? chrome.runtime.openOptionsPage()
            : window.open(chrome.runtime.getURL('options.html'))
    }

    render() {
        return html`
            <suppliers-component></suppliers-component>
            <button @click=${this.onClickOptionPage}>⚙ Options</button>
        `
    }
}

customElements.define('popup-app', PopupApp)
