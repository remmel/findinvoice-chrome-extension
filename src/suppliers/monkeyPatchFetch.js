/**
 * Many solution to inject js in the world context, see:
 * https://stackoverflow.com/questions/9515704/access-variables-and-functions-defined-in-page-context-from-an-extension
 * https://dev.to/jacksteamdev/advanced-config-for-rpce-3966#main-world-scripts
 */
//could also send event with data to the content context who will listen me
function proxyFetch(callback = null) {
    const originalFetch = fetch
    fetch = async (...args) => {
        let [resource, config ] = args
        const response = await originalFetch(resource, config)

        // if(response.url.startsWith("https://api.leboncoin.fr/api/consumergoods/proxy/v3/pages/transactions"))  {
        //     const response2 = response.clone()
        //     console.log('proxyFetch', await response2.json())
        // }

        callback ? callback(response) : console.log("intercepted fetch - mpf.js", response)

        return response
    };
}

function proxyXMLHttpRequest(callback = null){
    const originalXMLHttpRequestOpen = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function() {
        const originalOnLoad = this.onload; // Store original onload handler
        this.onload = function() {          // Override onload
            if (originalOnLoad) {           // Call original handler if it exists
                originalOnLoad.apply(this, arguments);
            }

            callback ? callback(response) : console.log("Intercepted XMLHttpRequest - mpf.js", this.response)
        };
        return originalXMLHttpRequestOpen.apply(this, arguments); // Call original open
    };
}


