import { LitElement, html } from 'lit'
import {customElement, property} from 'lit/decorators.js';
import {getPreviousMonthFirstDay} from "../utils_commons";

@customElement('settings-component')
// @ts-ignore
class SettingsComponent extends LitElement {
    @property({ type: String }) favoriteColor: string = 'red';
    @property({ type: Boolean }) likesColor: boolean = true;
    @property({ type: String }) statusMessage: string = '';
    @property({ type: String, state: true }) startDate: string = '';

    constructor() {
        super()
    }

    connectedCallback() {
        super.connectedCallback()
        this.restoreOptions()
    }

    restoreOptions() {
        chrome.storage.sync.get(
            {favoriteColor: this.favoriteColor, likesColor: this.likesColor, startDate: this.startDate},
            items => {
                this.favoriteColor = items.favoriteColor
                this.likesColor = items.likesColor
                this.startDate = items.startDate
            }
        )
    }

    saveOptions() {
        chrome.storage.sync.set(
            {
                favoriteColor: this.favoriteColor,
                likesColor: this.likesColor,
                startDate: this.startDate,
            },
            () => this.updateStatusMessage('Options saved.')
        )
    }

    updateStatusMessage(message: string) {
        this.statusMessage = message
        setTimeout(() => this.statusMessage = '', 750)
    }

    clearSyncCache() {
        chrome.storage.sync.clear(() => {
            this.favoriteColor = 'red'
            this.likesColor = true
            this.startDate = getPreviousMonthFirstDay()
            this.updateStatusMessage('Sync cache cleared.')
        })
    }

    onStartDateChange(e: Event) {
        this.startDate = (e.target as HTMLSelectElement).value
        this.saveOptions()

    }

    handleClearDate() {
        this.startDate = ''
    }

    render() {
        return html`
            <h2>Settings</h2>
            <!--
            <select value=${this.favoriteColor}
                    @change=${(e: Event) => this.favoriteColor = (e.target as HTMLSelectElement).value}>
                <option value="red">red</option>
                <option value="green">green</option>
                <option value="blue">blue</option>
                <option value="yellow">yellow</option>
            </select>
            <label>
                <input type="checkbox"
                       ?checked=${this.likesColor}
                       @change=${() => this.likesColor = !this.likesColor}
                />
                I like colors.
            </label>
            -->
            <div>
                Start date: <input type="date" .value=${this.startDate} @change=${this.onStartDateChange}/>
            </div>
            <br />
            <div id="status">${this.statusMessage}</div>
            <button @click=${this.saveOptions}>Save</button>
            <button @click=${this.clearSyncCache}>Reset</button>
        `
    }
}
