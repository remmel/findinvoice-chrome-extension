import {defineManifest} from '@crxjs/vite-plugin'
import {version} from './package.json'
import {SUPPLIERS} from "./src/suppliers/Suppliers";


const content_scripts = Object.entries(SUPPLIERS).map(([key, value]) => ({
    matches: value.matches,
    js: [`src/suppliers/${key}_content.js`]
}))

export default defineManifest({
    manifest_version: 3,
    name: "Invoice Downloader - crxjs",
    version,
    description: "Downloads invoices automatically from Orange, FreeMobile, OpenAI...",
    // host_permissions: [
    //     "https://*.stripe.com/*",
    // ],
    permissions: [
        "activeTab",
        "scripting",
        "storage",
        "downloads",
        "tabs",
        "webNavigation",
        "webRequest",
        "debugger"
    ],
    background: {
        service_worker: "src/worker/background.js",
        type: "module"
    },
    action: {
        default_popup: "src/ui/popup.html"
    },
    options_page: "src/ui/options.html",
    icons: {
        "128": "icon128.png"
    },
    host_permissions: ["https://www.leboncoin.fr/*"],
    content_scripts: [
        ...content_scripts,
    ],
    externally_connectable: {
        matches: ["https://www.leboncoin.fr/*"]
    },
    "web_accessible_resources": [{
        "matches": ["https://www.amazon.fr/*"], //everyone using the pdf extension
        "resources": ["node_modules/pdfjs-dist/build/pdf.worker.mjs"]
    }]
})
