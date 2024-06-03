// import leboncoin_mainWorld from './leboncoinfr_content_world2.js?script&module' - does not intercept early enough
import { sleep } from "../utils_commons.js";
import { addStyle, waitForSelector } from "./utils_content.js";

console.log("leboncoinfr_content")

// const script = document.createElement('script')
// script.src = chrome.runtime.getURL(leboncoin_mainWorld)
// script.type = 'module'
// document.head.prepend(script)


function convertDateFrToIso(dateStr) {
    const [dd, mm, yyyy] = dateStr.split('/')
    return `${yyyy}-${mm}-${dd}`
}

function getLastPathSegment(url) {
    const urlObj = new URL(url);
    const segments = urlObj.pathname.split('/')
    return segments.pop() || segments.pop()  // Handle potential trailing slash
}

//language=css
const printCss = `
    @media print {
        .bg-main-container{
            display: none;
        }

        .bg-surface{
            display: none;
        }
        
        button{
            display: none !important;
        }
        
        header{
            display: none;
        }

        .md\\:grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(300px, 1fr));
        }
        
        #footer{
            display: none;
        }
    }
`



async function main() {
    addStyle(printCss) // single page (to debug rendering print + responsive)
    await waitForSelector('#mainContent h1')
    const imgHTML = `
        <img alt="Logo" width="181" height="30"
           src="/logos/leboncoin.svg">`
    const mainContent = document.querySelector('#mainContent .max-w-page-max')
    mainContent.insertAdjacentHTML('afterbegin', imgHTML)

    //filename
    const datefr = document.querySelector('#mainContent aside p').textContent
    const date = convertDateFrToIso(datefr)
    const price = parseFloat(document.querySelector('h2').textContent.replace(',','.'))
    const id = getLastPathSegment(window.location.href)
    const fn = `${date}_leboncoin_${price}_${id}.pdf`
    document.title = fn

    await sleep(250) //for img to load
    window.print()
    await sleep(250) //for print window to be displayed, does not seem to be needed
    window.close()
}

if(window.location.href.startsWith('https://www.leboncoin.fr/compte/part/transaction/')){
    main()
}
