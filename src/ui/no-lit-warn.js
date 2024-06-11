const isDevelopment = import.meta.env.MODE === 'development';

if(isDevelopment) {
    const originalWarn = console.warn
    console.warn = (...args) => {
        // remove Lit warning
        if(args.length > 0 && typeof args[0] === 'string' && args[0].startsWith('Lit is in dev mode. Not recommended for production!')) {
            console.log('Lit!!', ...args)
        } else {
            originalWarn(...args)
        }
    }
}
