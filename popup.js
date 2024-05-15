document.getElementById('freeMobiledownloadInvoices')?.addEventListener('click', () => {
    console.log("popup.js")
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentTab = tabs[0];
        console.log("popup.js 2")
        if (!currentTab.url.startsWith('https://mobile.free.fr/')) {
            // If not on the Free Mobile website, redirect to it
            //chrome.tabs.update(currentTab.id, {url: 'https://mobile.free.fr/account/conso-et-factures'});
            //chrome.tabs.create({ url: 'https://mobile.free.fr/account/conso-et-factures' }) //because then()/callback don't work to inject content.js

            chrome.runtime.sendMessage({action: 'createFreeMobileTab'});
        } else {
            console.log("execute script")
            // If on the Free Mobile website, execute the content script
            chrome.scripting.executeScript({
                target: {tabId: currentTab.id},
                files: ['content.js']
            });
        }
    });
});
