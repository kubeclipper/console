/*
 * Copyright 2021 KubeClipper Authors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
const { resolve } = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const common = require('./webpack.common');
const theme = require('./theme');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

const root = (path) => resolve(__dirname, `../${path}`);
const version = common.version;

module.exports = (env = {}) => {
  return merge(common.commonConfig, {
    entry: {
      main: ['@babel/polyfill', root('src/core/index.dev.js')],
    },
    output: {
      filename: '[name].js',
      path: root('dist'),
      publicPath: '/',
      chunkFilename: `[name].bundle.${version}.js`,
    },
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.less$/,
          exclude: [/node_modules/],
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  mode: 'global',
                },
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [autoprefixer('last 2 version')],
                sourceMap: false,
              },
            },
            {
              loader: 'less-loader',
              options: {
                importLoaders: true,
                javascriptEnabled: true,
              },
            },
          ],
        },
        {
          test: /\.(less)$/,
          include: [/node_modules/],
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
            },
            {
              loader: 'less-loader',
              options: {
                javascriptEnabled: true,
                modifyVars: theme,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].[chunkhash].css',
      }),
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
        canPrint: true,
      }),
      new HtmlWebPackPlugin({
        template: root('src/asset/template/index.html'),
        filename: root('dist/index.html'),
        favicon: root('src/asset/logos/favicon.ico'),
      }),
      new CleanWebpackPlugin(['dist'], {
        root: resolve(__dirname, `../`),
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: resolve(__dirname, '../src/core/global.config.js'), // 不打包直接输出的文件
            to: './',
          },
        ],
      }),
      new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: /\.js$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          env: JSON.stringify(env),
        },
      }),
    ],
    optimization: {
      usedExports: true,
      splitChunks: {
        maxInitialRequests: 10,
        cacheGroups: {
          commons: {
            chunks: 'async',
            minChunks: 2,
            minSize: 0,
          },
          vendor: {
            test: /node_modules/,
            chunks: 'async',
            name: 'vendor',
            priority: 10,
            enforce: true,
          },
        },
      },
      runtimeChunk: {
        name: () => `runtime.${version}`,
      },
      minimize: true, // default true for production
      minimizer: [
        new TerserPlugin({
          parallel: true,
          extractComments: false,
          terserOptions: {
            compress: {
              drop_console: false,
              drop_debugger: true,
              pure_funcs: ['console.log'],
            },
          },
        }),
      ],
    },
  });
};
