document.querySelectorAll('#btn button').forEach(elt => elt.addEventListener('click', e => {
    const seller = e.target.getAttribute('data-seller')
    chrome.runtime.sendMessage({action: 'clickpopup', seller})
}))
