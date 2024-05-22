// https://stackoverflow.com/questions/9515704/access-variables-and-functions-defined-in-page-context-from-an-extension
var s = document.createElement('script');
s.src = chrome.runtime.getURL('monkeyPatchFetch.js');
s.onload = function() { this.remove(); };
// see also "Dynamic values in the injected code" section in this answer
(document.head || document.documentElement).appendChild(s);

//works for "late" requests
