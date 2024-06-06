import path from 'path'
import { glob } from 'glob'
import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const entryFiles = glob.sync(path.join(__dirname, './src/**/*worldmain.*'))

// Create an entry object where key is the name and value is the path to the file
const entries = entryFiles.reduce((acc, file) => {
    const name = path.basename(file, path.extname(file));
    acc[name] = file;
    return acc;
}, {});

console.log(entryFiles) //, path.resolve(__dirname, 'src'))

export default {
    entry: entries,
    output: {
        path: path.resolve('dist/build-iife'),
        iife: true,
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                // use: 'ts-loader',
                exclude: /node_modules/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: "tsconfig.webpack.json"
                    }
                }]
            },
        ],
    }
};
