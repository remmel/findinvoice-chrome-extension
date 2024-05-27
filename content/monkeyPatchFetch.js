console.log('monkeyPatchFetch.js')

//could also send event with data to the content context who will listen me

const { fetch: originalFetch } = window
window.fetch = async (...args) => {
    let [resource, config ] = args
    // request interceptor here
    const response = await originalFetch(resource, config)

    console.log("intercepted", response)
    // response interceptor here
    return response
};

const originalOpen = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function() {
    const originalOnLoad = this.onload; // Store original onload handler
    this.onload = function() {          // Override onload
        if (originalOnLoad) {           // Call original handler if it exists
            originalOnLoad.apply(this, arguments);
        }
        console.log("Intercepted AJAX Response:", this.responseText);
    };
    return originalOpen.apply(this, arguments); // Call original open
};
