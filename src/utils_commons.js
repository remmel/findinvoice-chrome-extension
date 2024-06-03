/**
 * Utils used by injected script AND background worker
 * @returns {Promise<any>}
 */


export async function getStartDate() {
    const {startDate} = await chrome.storage.sync.get({startDate: ''})
    return startDate
}

export const sleep = ms => new Promise(r => setTimeout(r, ms))
