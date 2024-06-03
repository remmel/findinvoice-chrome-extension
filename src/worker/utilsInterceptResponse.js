/**
 * Intercepting content of a request is pretty complex. Some workarounds:
 * - use debugger : but display a banner, see below
 * - intercept the request (not the response) and replay it
 * - use FF : https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/filterResponseData more info:
 * https://www.moesif.com/blog/technical/apirequest/How-We-Captured-AJAX-Requests-with-a-Chrome-Extension/
 * https://stackoverflow.com/questions/9515704/access-variables-and-functions-defined-in-page-context-from-an-extension
 */


/**
 * works but add a "banner", would need also to filter responses
 */
function interceptXhrResponseUsingDebugger(tabId, urlStarts) {
    chrome.debugger.attach({ttabId}, '1.0', e => {
        chrome.debugger.sendCommand({tabId}, "Network.enable")
        chrome.debugger.onEvent.addListener((debuggeeId, message, params) => {
            if (tabId !== debuggeeId.tabId) return
            if(message !== "Network.responseReceived") return
            if(!params.response.url.startsWith(urlStarts)) return

            chrome.debugger.sendCommand({tabId}, "Network.getResponseBody", {"requestId": params.requestId}, response => {
                console.log("body?", response, debuggeeId, {message, params})
                //     chrome.debugger.detach(debuggeeId);
            })

        })
    })
}

// response is empty
export function interceptXhrResponseUsingDebugger2(tabId, urlPattern = '<all_urls>') {
    chrome.webRequest.onCompleted.addListener(
        function (details) {
            // Filter for XHR requests
            if (details.type === 'xmlhttprequest') {
                console.log('XHR completed from:', details.url);
                // Intercept the response body
                chrome.debugger.attach({tabId: details.tabId}, "1.3", () => {
                    chrome.debugger.sendCommand({tabId: details.tabId}, "Network.getResponseBody", {requestId: details.requestId}, response => {
                            console.log('Response body:', response);
                            chrome.debugger.detach({tabId: details.tabId});
                        }
                    );
                });
            }
        },
        {urls: [urlPattern]}
    );
}

//could be possible when devtools is opened via https://developer.chrome.com/docs/extensions/reference/api/devtools/network (cannot be opened automatically)


export class ReplayXhr {
    /**
     *
     * @param {string} url
     * @param {Response} callback
     */
    constructor(url, callback) {
        this.url = url
        this.callback = callback
        //need to listen for both event, has requestHeaders and requestBody are req
        chrome.webRequest.onBeforeRequest.addListener(details =>
            this.onBeforeRequest(details), {urls: ["<all_urls>"]}, ["requestBody"])

        //or onSendHeaders
        chrome.webRequest.onBeforeSendHeaders.addListener(details =>
            this.onBeforeSendHeaders(details), {urls: ["<all_urls>"]}, ["requestHeaders"])
    }

    onBeforeRequest(details) {
        if (details.url.startsWith(this.url)) {//} && !this.once) {
            this.requestBody = details.requestBody
            console. log('details:', details)
        }
    }

    onBeforeSendHeaders(details) {
        if (details.url.startsWith(this.url)) {
            this.refetch(details)
        }

        return {requestHeaders: details.requestHeaders}
    }

    refetch(details) {
        let headers = {}

        for(const {name, value} of details.requestHeaders)
            headers[name] = value

        // make sure no infinite replay (also try with variable, but not good)
        const HEADER_REPLAY = 'X-Rp-ext'
        if(headers[HEADER_REPLAY]) return true
        headers[HEADER_REPLAY] = '1'

        //note that for example Referer is missing from headers

        const body = this.requestBody
            ? Object.entries(this.requestBody.formData).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&')
            : null

        fetch(details.url, {
            method: details.method,
            headers,
            body,
        }).then(this.callback)
    }
}

function interceptDownloadedFiles() {
    chrome.downloads.onCreated.addListener((downloadItem) => {
        console.log('Download onCreated:', downloadItem)

        chrome.downloads.onChanged.addListener(function onChanged(downloadDelta) {
            console.log('Download onChanged:', downloadDelta)
            if (downloadDelta.state && downloadDelta.state.current === 'complete') {
                chrome.downloads.onChanged.removeListener(onChanged);

                chrome.downloads.search({ id: downloadDelta.id }, (results) => {
                    if (results && results.length > 0) {
                        const filePath = results[0].filename;
                        const downloadUrl = results[0].url;
                        const fileId = results[0].id;

                        console.log(downloadUrl, filePath)

                        // Read the file
                        // chrome.downloads.download({ url: downloadUrl, filename: filePath, saveAs: false }, () => {
                        //     fetch(downloadUrl)
                        //         .then(response => response.blob())
                        //         .then(blob => {
                        //             const formData = new FormData();
                        //             formData.append('file', blob, filePath);
                        //
                        //             // Upload the file
                        //             fetch('http://example.com/upload', {
                        //                 method: 'POST',
                        //                 body: formData
                        //             }).then(response => {
                        //                 if (response.ok) {
                        //                     console.log('File uploaded successfully');
                        //                 } else {
                        //                     console.error('File upload failed');
                        //                 }
                        //             }).catch(error => {
                        //                 console.error('Error uploading file:', error);
                        //             });
                        //         }).catch(error => {
                        //         console.error('Error fetching file:', error);
                        //     });
                        // });
                    }
                });
            }
        });
    });

}

