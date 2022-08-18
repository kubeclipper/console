# 快速开始

## 开发准备

- node 环境

  - package.json 中要求：`"node": ">=12"`
  - 验证 nodejs 版本

    ```shell
    node -v
    ```

- yarn

  - 安装 yarn

    ```shell
    npm install -g yarn
    ```

- 安装依赖包

  - 在项目根目录下执行，即`package.json`同级，需要耐心等待安装完成

    ```shell
    yarn install
    ```

- 准备好可用的后端

  - 准备好可访问的后端，举个例子：<https://172.20.150.52:8080>
  - 修改`config/common.js`中的相应配置：

    ```javascript
    module.exports = {
      devIp: '172.20.150.52:8080',
    };
    ```

- 配置访问的 host 与 port

  - 修改`devServer.host`与`devServer.port`
  - 修改`config/webpack.dev.js`中的相应配置

    ```javascript
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
    ```

- 搭建完成

  - 在项目根目录下执行，即`package.json`同级

    ```shell
    yarn start
    ```

  - 使用`config/webpack.dev.js`中配置的`host`与`port`访问即可，如`http://localhost:8089`
  - 开发使用的前端实时更新环境搞定。

## 生产环境使用的前端包

- 具备符合要求的`nodejs`与`yarn`
- 在项目根目录下执行，即`package.json`同级

  ```shell
  yarn build
  ```

- 打包后的文件在`dist`目录，交给部署相关人员即可。

## 测试使用的前端包

- 具备符合要求的`nodejs`与`yarn`
- 在项目根目录下执行，即`package.json`同级

  ```shell
  yarn build:test
  ```

- 打包后的文件在`dist`目录
- 注意！！！这个测试包为了测出代码覆盖率的
- 建议使用 nginx，以完成带有代码覆盖率的 E2E 测试。
