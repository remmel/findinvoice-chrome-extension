window.toto = () => console.log('toto')

console.log('monkeyPatchFetch.js')

//could also send event with data to the content_opencom.js who will listen me

const { fetch: originalFetch } = window
window.fetch = async (...args) => {
    let [resource, config ] = args
    // request interceptor here
    const response = await originalFetch(resource, config)

    console.log("intercepted", response)
    // response interceptor here
    return response
};
