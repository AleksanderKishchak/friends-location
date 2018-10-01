let path = require('path');
let ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

let conf = {
    entry: [
        'babel-polyfill',
        './src/js/index.js',
        './src/sass/main.sass'
    ],
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js',
        publicPath: 'dist/'
    },
    devServer: {
        overlay: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                //exclude: 'node_modules',
            },
            {
                test: /\.sass$/,
                include: path.resolve(__dirname, 'src/sass'),
                use: ExtractTextPlugin.extract({
                  use: [{
                      loader: "css-loader",
                      options: {
                        sourceMap: true,
                        minimize: true,
                        url: false
                      }
                    },
                    {
                      loader: "sass-loader",
                      options: {
                        sourceMap: true
                      }
                    }
                  ]
                })
              }
           /*  {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    //fallback: "style-loader",
                    use: "css-loader"
                })
                
            } */
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: './css/style.css',
            allChunks: true,
        }),
        new CopyWebpackPlugin([ { 
            from: path.resolve(__dirname, 'src/img'),
             to: path.resolve(__dirname, 'dist/img')
            } ], {})
    ]
}

module.exports = (env, options) => {
    let production = options.mode === 'production';

    conf.devtool = production
                ? 'source-map'
                : 'eval-sourcemap';

    return conf;
}