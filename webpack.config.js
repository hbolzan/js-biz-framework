module.exports = {
    entry: './src/index.js',
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            }

        ]
    },
    resolve: {
        extensions: ['*', '.js'],
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: './dist',
        watchOptions: {
            ignored: "**/.#*"
        },
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                router: () => "http://127.0.0.1:9001",
            }
        }
    }
};
