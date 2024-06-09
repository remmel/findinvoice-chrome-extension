
import {getDocument} from 'pdfjs-dist/build/pdf.mjs'
pdfjsLib.GlobalWorkerOptions.workerSrc = '/lib/pdf.worker.mjs' //TODO find a cleaner way

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
