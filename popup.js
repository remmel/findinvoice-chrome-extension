document.querySelectorAll('#btn button').forEach(elt => elt.addEventListener('click', e => {
    const supplier = e.target.getAttribute('data-supplier')
    chrome.runtime.sendMessage({action: 'clickpopup', supplier})
}))
