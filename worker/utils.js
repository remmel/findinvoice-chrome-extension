export const sleep = ms => new Promise(r => setTimeout(r, ms))

// {a:1} -> {name:'a', value:1}
function transformKVToNameValueAttribute(obj) {
    const [[key, value]] = Object.entries(obj);
    return { name: key, value: value }
}

/**
 * Convert associative array to associative array with name and value attributes
 * Eg [{a:1}] to [{name:'a', value:1}]
 * @param headers
 * @returns {*|null}
 */
export function convertAssoc(headers) {
    return headers
        ? headers.map(obj => transformKVToNameValueAttribute(obj))
        : null
}
