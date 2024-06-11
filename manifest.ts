import {defineManifest} from '@crxjs/vite-plugin'
import {version} from './package.json'
import {SUPPLIERS} from "./src/suppliers/Suppliers";


const content_scripts = Object.entries(SUPPLIERS).map(([key, value]) => ({
    matches: value.matches,
    all_frames: value.all_frames,
    js: [`src/suppliers/${key}_content.js`]
}))

export default defineManifest({
    manifest_version: 3,
    name: "Invoices Downloader",
    version,
    description: "Download invoices automatically from various service providers, e-commerce platforms and more.",
    // host_permissions: [
    //     "https://*.stripe.com/*",
    // ],
    permissions: [
        // "activeTab", // does not seems to be needed
        "scripting", // needed to inject world main script in order to intercept xhr body response content to get the list of invoices
        "storage", //needed to store the invoices already downloaded to avoid re-downloading and settings such as start date
        "downloads", // needed to let the worker/background download an invoice on the user's computer
        "tabs", // needed to open or update a tab, or close the one which was opened
        // "webNavigation", // needed when I was injecting myself script
        // "webRequest", //needed if I would like to intercept and reply xhr
        // "debugger" //needed if I would like to intercept a xhr and view its body response
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
