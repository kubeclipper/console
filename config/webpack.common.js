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
const webpack = require('webpack');
const { normalize, resolve } = require('path');

const root = (path) => resolve(__dirname, `../${path}`);
const version = Math.floor(Date.now() / 1000);

module.exports = {
  version: version,
  commonConfig: {
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: [root('src')],
          use: ['thread-loader', 'cache-loader'],
        },
        {
          test: /\.(png|gif|jpg)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 10240,
                name: normalize(`asset/image/[name].[ext]`),
              },
            },
          ],
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: normalize('./[name].[ext]'),
              },
            },
          ],
          include: [root('src/asset/logos/logo.svg')],
        },
        {
          test: /\.(woff|woff2|ttf|eot|svg)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 10240,
                name: normalize(`asset/image/[name].[ext]`),
              },
            },
          ],
          exclude: [root('src/asset/logos/logo.svg')],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      modules: [root('src'), root('src/pages'), 'node_modules'],
      alias: {
        src: root('src'),
        asset: root('src/asset'),
        image: root('src/asset/image'),
        core: root('src/core'),
        layouts: root('src/layouts'),
        components: root('src/components'),
        containers: root('src/containers'),
        pages: root('src/pages'),
        utils: root('src/utils'),
        stores: root('src/stores'),
        locales: root('src/locales'),
        styles: root('src/styles'),
        hooks: root('src/hooks'),
        resources: root('src/resources'),
      },
    },
    plugins: [new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)],
    externals: {
      _config: 'global_config',
    },
  },
};
