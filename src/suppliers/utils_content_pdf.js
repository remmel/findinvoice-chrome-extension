
import {getDocument} from 'pdfjs-dist/build/pdf.mjs'
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('/node_modules/pdfjs-dist/build/pdf.worker.mjs') //copied by crxjs

// Do not work on background worker
export async function extractTextFromData(buffer) {
    const pdfDoc = await getDocument({ data: buffer }).promise
    let text = '';
    for(let i = 1; i <= pdfDoc.numPages; i++) {
        let page = await pdfDoc.getPage(i)
        const textContent = await page.getTextContent();
        text += `PAGE=${i}:\n`+textContent.items.map(i => i.str).join('\n')+'\n'
    }
    return text;
}
