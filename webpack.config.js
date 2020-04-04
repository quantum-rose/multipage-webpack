const { resolve } = require('path');
const { readdirSync } = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

const CDN_URL = 'http://127.0.0.1:5500/dist/'; // ! cdn资源地址，如果是 public 目录下的资源，由于没有经过打包，不会自动拼接地址

/**
 * 入口
 */
const entry = {};

/**
 * 插件
 */
const plugins = [
    new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:8].css',
    }),
    new OptimizeCssAssetsWebpackPlugin(),
];

/**
 * 导入所有页面
 */
readdirSync('./src/pages/').forEach((pageName) => {
    const pagePath = resolve(__dirname, './src/pages/', pageName);
    const fileNames = readdirSync(pagePath);
    const pageEntry = fileNames.find((item) => /\.js$/.test(item));
    const pageTemplate = fileNames.find((item) => /\.ejs$/.test(item));
    entry[pageName] = resolve(pagePath, pageEntry);
    plugins.push(
        new HtmlWebpackPlugin({
            template: resolve(pagePath, pageTemplate),
            filename: pageName + '.html',
            chunks: [pageName],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
            },
            favicon: './public/favicon.ico',
        })
    );
});

/**
 * 公共样式loader
 */
const commonStyleLoader = [
    {
        loader: MiniCssExtractPlugin.loader,
        options: {
            publicPath: '../',
        },
    },
    'css-loader',
    {
        loader: 'postcss-loader',
        options: {
            ident: 'postcss',
            plugins: () => [require('postcss-preset-env')],
        },
    },
];

/**
 * 配置
 */
const config = {
    entry,
    output: {
        filename: 'js/[name].[contenthash:8].js',
        path: resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: commonStyleLoader,
            },
            {
                test: /\.scss$/,
                use: [...commonStyleLoader, 'sass-loader'],
            },
            {
                test: /\.(jpg|png|gif|bmp|svg)$/,
                loader: 'url-loader',
                options: {
                    limit: 0,
                    esModule: false,
                    name: '[name].[contenthash:8].[ext]',
                    outputPath: 'imgs',
                },
            },
            {
                test: /\.ejs$/,
                loader: 'ejs-loader',
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    '@babel/preset-env',
                                    {
                                        useBuiltIns: 'usage',
                                        corejs: { version: 3 },
                                    },
                                ],
                            ],
                            cacheDirectory: true,
                        },
                    },
                    {
                        loader: 'eslint-loader',
                        options: { fix: true },
                    },
                ],
            },
            {
                exclude: /\.(css|scss|js|json|html|ejs|jpg|png|gif|bmp|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[contenthash:8].[ext]',
                    outputPath: 'assets',
                },
            },
        ],
    },
    plugins,
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@components': resolve(__dirname, './src/components'),
            '@images': resolve(__dirname, './src/images'),
            '@assets': resolve(__dirname, './src/assets'),
            '@utils': resolve(__dirname, './src/utils'),
        },
    },
    devServer: {
        contentBase: resolve(__dirname, 'public'),
        publicPath: 'http://localhost:8080/',
        compress: true,
        port: 8080,
        open: true,
    },
};

module.exports = (env, argv) => {
    /**
     * 开发环境
     */
    if (argv.mode === 'development') {
        config.output.publicPath = '/';
        config.plugins.push(
            /**
             * DefinePlugin 的工作原理是字符串替换，类似 C 中的 #define
             * 变量的值必须为字符串，代码中的这些变量名经过打包后会替换为该字符串
             * 所以，如果期望替换后的结果为字符串值，变量的值必须用引号包裹
             * 比如 '"字符串"'，或者 '\'字符串\''
             * 建议的做法是统一使用 JSON.stringify() 函数进行转换
             */
            new webpack.DefinePlugin({
                // webpack 会自动将当前环境变量挂载到 process.env.NODE_ENV，无需手动配置
                'process.env.BASE_URL': JSON.stringify('/'), // 将全局变量挂载到 process.env 下的好处是不用处理 eslint 报错的问题
                'process.env.IS_DEV': JSON.stringify(true),
                NODE_ENV: JSON.stringify(argv.mode), // 在 js 中使用此变量会导致 eslint 报错 'NODE_ENV is not defined'
                BASE_URL: JSON.stringify('/'),
                IS_DEV: JSON.stringify(true),
            })
        );
        config.devtool = 'eval-source-map';
    }

    /**
     * 生产环境
     */
    if (argv.mode === 'production') {
        config.output.publicPath = CDN_URL;
        config.plugins.push(
            new (require('copy-webpack-plugin'))([
                // 将 public 目录下的文件复制到打包后的目录中
                {
                    from: './public/',
                    to: './',
                },
            ]),
            new (require('clean-webpack-plugin').CleanWebpackPlugin)(), // 打包前清除上一次打包的内容
            new webpack.DefinePlugin({
                'process.env.BASE_URL': JSON.stringify(CDN_URL),
                'process.env.IS_DEV': JSON.stringify(false),
                NODE_ENV: JSON.stringify(argv.mode),
                BASE_URL: JSON.stringify(CDN_URL),
                IS_DEV: JSON.stringify(false),
            })
        );
        config.devtool = 'source-map';
    }

    return config;
};
