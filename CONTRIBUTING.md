The code is currently dirty.
I've added 4 sellers, and different approaches is used for each.
Will have to figure out for a "framework" later:
- where to locate download code (worker vs tab)
- download on the user computer or upload to GDrive, etc...
- automatically inject the code of a seller (manifest.json > content_scripts)
- who lead the logic (worker vs tab), knowing that specific action can only be performed on one or the other


# Dev notes for myself
If I don't want to click on the popup button multiple times (when not connected to free.fr), 2 solutions:

- inject content.js from manifest.json (and open the new tab in the popup.js)

  "____content_scripts": [
  {
  "matches": ["https://mobile.free.fr/*"],
  "js": ["content.js"]
  }
  ],

- uses the worker to open the new tab and to inject content.js and add in manifest.json
  "host_permissions": [
  "https://mobile.free.fr/*"
  ]

# Limitations

- no autologin with Google Password Manager : a tab opened by that extension, won't have the field filled by Google Password if no interaction from the user (workaround is to store the password)
- cannot easily intercept xhr response body, like FF : https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/filterResponseData more info:
  https://www.moesif.com/blog/technical/apirequest/How-We-Captured-AJAX-Requests-with-a-Chrome-Extension/
  https://stackoverflow.com/questions/9515704/access-variables-and-functions-defined-in-page-context-from-an-extension
# Diagrams
```plantuml
@startuml
User -> login: Click
login --> User: Please log

User -> login: Sign in
login -> logged
logged -> logged: dlInvoices()
@enduml
```


https://developer.chrome.com/docs/extensions/samples
