console.warn = (...args) => {
    // remove Lit warning
    if(args.length > 0 && typeof args[0] === 'string' && args[0].startsWith('Lit is in dev mode. Not recommended for production!')) {
        console.log('Lit!!', ...args)
    } else {
        console.warn(...args)
    }
}
