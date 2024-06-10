import { LitElement, html, css } from 'lit'
import {customElement} from "lit/decorators.js";
import './settings-component'
import './cache-list-component'
import './suppliers-component'

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

    render() {
        return html`
            <suppliers-component></suppliers-component>
            <settings-component></settings-component>
            <cache-list-component></cache-list-component>
        `
    }
}
