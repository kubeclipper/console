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
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { devIp } = require('./common');
const root = (path) => resolve(__dirname, `../${path}`);
const GitRevisionPlugin = require('git-revision-webpack-plugin');

const gitRevision = new GitRevisionPlugin();

module.exports = () => {
  const devServer = {
    host: 'localhost',
    port: 8089,
    contentBase: root('dist'),
    historyApiFallback: {
      disableDotRule: true,
    },
    compress: true,
    hot: true,
    hotOnly: true,
    inline: true,
    disableHostCheck: true,
    stats: {
      children: false,
    },
  };

  devServer.proxy = {
    '/apis': {
      target: `https://${devIp}`, //9节点 172.20.151.92:8099
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        '^/apis': '/',
      },
    },
  };

  return merge(common.commonConfig, {
    entry: {
      main: ['@babel/polyfill', root('src/core/index.js')],
    },
    output: {
      filename: '[name].js',
      path: root('dist'),
      publicPath: '/',
    },
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    devServer: devServer,
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.less$/,
          exclude: [/node_modules/],
          use: [
            {
              loader: 'style-loader',
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
                sourceMap: true,
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
      new webpack.HotModuleReplacementPlugin(),
      new ReactRefreshWebpackPlugin({ overlay: false }),
      new HtmlWebPackPlugin({
        template: root('src/asset/template/index.html'),
        filename: root('dist/index.html'),
        favicon: root('src/asset/logos/favicon.ico'),
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: resolve(__dirname, '../src/core/global.config.js'),
            to: './',
          },
        ],
      }),
      gitRevision,
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          COMMITHASH: JSON.stringify(gitRevision.version()),
        },
      }),
    ],
  });
};
