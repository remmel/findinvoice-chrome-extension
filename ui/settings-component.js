import { LitElement, html, css } from '../lib/lit-core.min.js'

class SettingsComponent extends LitElement {
    static get properties() {
        return {
            favoriteColor: {type: String},
            likesColor: {type: Boolean},
            statusMessage: {type: String},
            startDate: {type: String, state: true}
        }
    }

    constructor() {
        super()
        this.favoriteColor = 'red'
        this.likesColor = true
        this.statusMessage = ''
        this.startDate = ''
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

    updateStatusMessage(message) {
        this.statusMessage = message
        setTimeout(() => this.statusMessage = '', 750)
    }

    clearSyncCache() {
        chrome.storage.sync.clear(() => {
            this.favoriteColor = 'red'
            this.likesColor = true
            this.startDate = ''
            this.updateStatusMessage('Sync cache cleared.')
        })
    }

    handleClearDate() {
        this.startDate = ''
    }

    render() {
        return html`
            <h2>Settings</h2>
            <select value=${this.favoriteColor}
                    @change=${e => this.favoriteColor = e.target.value}>
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
            <div>
                Start date: <input type="date" .value=${this.startDate}
                                   @change=${e => this.startDate = e.target.value}/>
                <button @click=${this.handleClearDate}>Clear date</button>
            </div>
            <div id="status">${this.statusMessage}</div>
            <button @click=${this.saveOptions}>Save</button>
            <button @click=${this.clearSyncCache}>Reset</button>
        `
    }
}

customElements.define('settings-component', SettingsComponent)
