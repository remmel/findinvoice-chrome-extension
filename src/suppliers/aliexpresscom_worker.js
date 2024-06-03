import { ReplayXhr } from "../worker/utilsInterceptResponse";

new ReplayXhr('https://acs.aliexpress.com/h5/mtop.aliexpress.trade.buyer.order.detail/1.0/', response => {
    response.text().then(text => {
        const json = text.slice(12, -1)
        const data = JSON.parse(json)
        if(!data.ret[0].startsWith('SUCCESS')) return
        const orderStatusBlocks = Object.values(data.data.data).filter(item => item.tag === "detail_order_status_block")
        if(orderStatusBlocks.length === 0) return console.log('block not found')
        const url = orderStatusBlocks[0].fields.buttonVOList.find(button => button.type === "DOWNLOAD_INVOICE").href
        chrome.downloads.download({url})
    })
})
