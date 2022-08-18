# 前端项目框架

## 目录简介

```sh
.
├── Gruntfile.js (用于收集i18n)
├── LICENSE
├── Makefile
├── config
│   ├── theme.js
│   ├── webpack.common.js
│   ├── webpack.dev.js  (开发时使用的webpack配置)
│   ├── webpack.e2e.js  (e2e测试时使用的webpack配置，能生成用于检测覆盖率的包)
│   └── webpack.prod.js (生成环境使用的webpack打包配置)
├── cypress.json    (e2e的配置)
├── docker
│   ├── dev.dockerfile
│   ├── nginx.conf
│   ├── prod.dockerfile
├── docs    (文档)
├── jest.config.js  (单元测试配置)
├── jsconfig.json
├── package.json
├── src
│   ├── asset
│   │   ├── image   (图片放置位置)
│   │   └── template
│   │       └── index.html
│   ├── components  (公用组件)
│   ├── containers
│   │   ├── Action
│   │   │   ├── ConfirmAction   (确认型的action基类)
│   │   │   ├── LinkAction   (单页的action基类)
│   │   │   ├── ModalAction   (弹窗型的action基类)
│   │   │   ├── StepAction   (分多步的单页action)
│   │   │   └── index.jsx
│   │   ├── BaseDetail  (带有详情信息的详情页基类)
│   │   ├── List    (列表页的基类)
│   │   ├── TabDetail   (带有tab切换的详情页的基类)
│   │   └── Tab (带有tab切换的列表页)
│   ├── core
│   │   ├── App.jsx
│   │   ├── i18n.js
│   │   ├── index.jsx   (入口)
│   │   └── routes.js   (按模块的路由配置)
│   │   └── menu.js   (菜单配置)
│   ├── layouts
│   │   ├── Base    (登录后使用的布局)
│   │   ├── Blank    (空白布局)
│   │   ├── User    (登录使用的布局)
│   ├── locales (翻译)
│   │   ├── en.json
│   │   ├── index.js
│   │   └── zh.json
│   ├── pages   (页面-目录结构按照：菜单项--二级菜单 分配，其中二级菜单的页面放在containers文件夹下)
│   ├── resources   (存放各资源的自身使用的公用函数，状态等)
│   ├── stores  (数据处理，按资源类型划分文件夹)
│   │   ├── base.list.js    (列表数据的基类)
│   │   ├── base.js (数据操作的基类)
│   │   ├── root.js
│   ├── styles  (公用样式)
│   │   ├── base.less
│   │   ├── main.less
│   │   └── variables.less
│   └── utils   (基础函数)
├── test  (单元测试)
├── cypress  (E2E 测试)
└── yarn.lock
```

## 一级目录简介

- `Gruntfile.js`：用于收集 i18n
- `LICENSE`: 该项目 License
- `Makefile`:
- `config`目录: webpack 配置，其内包含公用、开发环境、测试环境、生成环境下的 webpack 配置
- `cypress.json`: e2e 测试的配置文件
- `docker`: 内含开发环境、生成环境、测试环境使用的 docker 配置
- `docs`目录: 文档介绍，包含中文、英文、开发说明文档、测试说明文档
- `jest.config.js`: 单元测试的配置文件
- `jsconfig.json`: js 代码的配置文件
- `package.json`: 安装包、命令等配置文件
- `yarn.lock`: 包的版本锁定文件
- `.babelrc`: babel 配置文件
- `.dockerignore`: docker 忽略的文件配置
- `.eslintignore`: eslint 忽略的文件配置
- `.eslint`: eslint 配置
- `.gitignore`: git 忽略的文件配置
- `.gitreview`: gitreview 配置
- `.prettierignore`: prettier 忽略的文件配置
- `.prettierrc`: prettier 的配置
- `src`: 开发代码所在文件夹！！！
- `cypress`: e2e 测试代码及单元测试的基础代码
- `tests`： 单元测试相关

## src 目录介绍

- `src/components`目录：公共组件
- `src/asset`目录：images, template 等静态文件
- `src/containers`目录:
  - 带状态的组件
  - 基础类
    - Action
    - BaseDetail
    - List
    - Tab
    - TabDetail
    - Table
- `src/core`目录:
  - `index.js`: 入口文件
  - `routes.js`: 按模块的路由配置
  - `i18n.js`
  - `App.jsx`
  - `menu.jsx`: 控制台使用的菜单配置
- `src/layouts`目录:
  - 定义所有整体页面布局的组件
    - 空白布局 BlankLayout
    - 登录页使用的布局 UserLayout
    - 内容页使用的布局 BaseLayout(列表、详情、表单等使用)
- `src/locales`目录: i18n
- `src/resources`目录:
  - 定义各资源被公用的状态 / 搜索项
  - 定义各资源被公用的表格列
  - 定义各资源的复用函数
- `src/stores`目录:
  - 对资源的数据获取、操作等
  - 按照资源名小写字母加连字符命名
- `src/utils`目录:
  - 公共函数(时间处理、正则、cookie、localStorage、......)
  - 对应的单元测试，以 test.js 或 spec.js 结尾
- `src/styles`目录: 基础样式、公用样式、样式变量等
- `src/pages`目录:
  - 按照页面层级结构递进(按照：菜单项--二级菜单)
  - 所有目录命名均为小写加连字符命名, 目录包含两个文件夹 `containers` 和 `routers`, 一个文件 `App.js`
  - `containers`下存放二级目录对应的页面
  - `routes`用于配置路由
