import { LitElement, html, css } from 'lit'
import {customElement} from 'lit/decorators.js';


import './suppliers-component.js'

@customElement('popup-app')
// @ts-ignore
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
            <button @click=${this.onClickOptionPage}>⚙ Options</button>
            <suppliers-component></suppliers-component>
        `
    }
}
