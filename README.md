# KubeClipper Console

KubeClipper console is the web for [KubeClipper](https://github.com/kubeclipper/kubeclipper).

## Getting Started

### Prerequisite

#### Node.js

Console is written using Javascript. If you don't have a Node.js development environment, please [set it up](https://nodejs.org/en/download/). The minimum version required is `12.18`.

#### Yarn

We use [Yarn](https://yarnpkg.com/) to do package management. If you don't have yarn, use the following to install:

```
npm install -g yarn@1.22.4
```

The minimum version required is `1.22.4`, but you can use a newer version.

### Install dependencies

In the project root directory, same level as package.json.

```shell
yarn install
```

> If you have trouble downloading the dependencies, try the following
>
> `yarn config set registry https://registry.npmmirror.com`

### Start console

config kubeclipper console apiserver:

```shell
module.exports = {
  devIp: 'xxxxxx:8080',
};
```

```bash
yarn start
```

Console app is running at port `8089`, But if you not config correct apiserver, you shouldn't be able to login.

### Build console

```bash
yarn build
```

## How to build container image

```sh
docker build -t kubeclipper-console .
```

## How to submit a PR

Follow [Contribution Rules](https://github.com/kubeclipper/community) to commit your codes.

## Others

1. [Catalog Introduction](./docs/2-catalog-introduction.md)
2. [How To Develop](./docs/1-ready-to-work.md)
3. [I18n](./docs/3-I18n-introduction.md)
4. [E2E & Unit Test](./docs/4-test.md)
