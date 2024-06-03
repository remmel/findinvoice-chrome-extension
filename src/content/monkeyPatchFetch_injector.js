/**
 * Many solution to inject js in the world context, see:
 * https://stackoverflow.com/questions/9515704/access-variables-and-functions-defined-in-page-context-from-an-extension
 * https://dev.to/jacksteamdev/advanced-config-for-rpce-3966#main-world-scripts
 */
var s = document.createElement('script');
s.src = chrome.runtime.getURL('content/monkeyPatchFetch.js');
s.onload = function() { this.remove(); };
// see also "Dynamic values in the injected code" section in this answer
(document.head || document.documentElement).appendChild(s);

console.log('monkeyPatchFetch_injector.js', s.src)
