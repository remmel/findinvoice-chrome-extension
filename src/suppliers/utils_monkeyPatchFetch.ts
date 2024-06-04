/**
 * Many solution to inject js in the world context, see:
 * https://stackoverflow.com/questions/9515704/access-variables-and-functions-defined-in-page-context-from-an-extension
 * https://dev.to/jacksteamdev/advanced-config-for-rpce-3966#main-world-scripts
 */
//could also send event with data to the content context who will listen me

export const proxyFetch = function(callback: (response: Response) => void) {
    const originalFetch = fetch
    window.fetch = async (...args) => {
        let [resource, config ] = args
        const response = await originalFetch(resource, config)
        callback(response)
        return response
    }
}

// export const proxyXMLHttpRequest = function(callback = null){
//     const originalXMLHttpRequestOpen = XMLHttpRequest.prototype.open;
//
//     XMLHttpRequest.prototype.open = function() {
//         const originalOnLoad = this.onload; // Store original onload handler
//         this.onload = function() {          // Override onload
//             if (originalOnLoad) {           // Call original handler if it exists
//                 originalOnLoad.apply(this, arguments)
//             }
//
//             callback(response)
//         }
//         return originalXMLHttpRequestOpen.apply(this, arguments); // Call original open
//     };
// }


