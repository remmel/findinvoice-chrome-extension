import {proxyFetch} from "./utils_monkeyPatchFetch";

let i = 0
proxyFetch(async response => {
 console.log(++i, response.url)
})
